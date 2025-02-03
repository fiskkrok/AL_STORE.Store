using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;
using Store.Application.Products.Models;
using Store.Domain.Entities.Product;
using Store.Domain.Enums;
using Store.Domain.ValueObjects;
using Store.Infrastructure.Persistence;
using Store.Infrastructure.Services.Models;

namespace Store.Infrastructure.Services;

public class ProductSyncService
{
    private readonly ILogger<ProductSyncService> _logger;
    private readonly StoreDbContext _dbContext;
    private readonly IAdminApiClient _adminClient;
    private readonly IDomainEventService _domainEventService;
    private readonly IMapper _mapper;
    private readonly AsyncRetryPolicy<BulkProductsResponse> _retryPolicy;

    public ProductSyncService(
        ILogger<ProductSyncService> logger,
        StoreDbContext dbContext,
        IAdminApiClient adminClient,
        IDomainEventService domainEventService,
        IMapper mapper)
    {
        _logger = logger;
        _dbContext = dbContext;
        _adminClient = adminClient;
        _domainEventService = domainEventService;
        _mapper = mapper;

        // Define retry policy
        _retryPolicy = Policy<BulkProductsResponse>
            .Handle<HttpRequestException>()
            .Or<TimeoutException>()
            .WaitAndRetryAsync(3, retryAttempt =>
                    TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning(exception.Exception,
                        "Retry {RetryCount} of {MaxRetries} after {Delay}s delay due to {Message}",
                        retryCount, 3, timeSpan.TotalSeconds, exception.Exception.Message);
                });
    }
    public async Task SyncProductsAsync(CancellationToken ct = default)
    {
        var syncHistory = new ProductSyncHistory(
            Guid.NewGuid().ToString(),
            DateTime.UtcNow);

        try
        {
            using var scope = _logger.BeginScope(
                new Dictionary<string, object>
                {
                    ["BatchId"] = syncHistory.BatchId,
                    ["Operation"] = "ProductSync"
                });

            _logger.LogInformation("Starting product sync");

            var strategy = _dbContext.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
                try
                {
                    var lastSync = await GetLastSuccessfulSyncTimestamp(ct);

                    // Use retry policy for API call
                    var bulkResponse = await _retryPolicy.ExecuteAsync(async () =>
                        await _adminClient.GetAllProductsAsync(lastSync, ct));

                    // Process in batches
                    foreach (var batch in bulkResponse.Products.Chunk(100))
                    {
                        await ProcessProductBatchWithRetry(
                            _mapper.Map<IEnumerable<ProductDto>>(batch),
                            syncHistory,
                            ct);

                        _logger.LogInformation(
                            "Processed batch of {Count} products",
                            batch.Length);
                    }

                    syncHistory.Complete(bulkResponse.Products.Count);
                    _dbContext.SyncHistory.Add(syncHistory);
                    await _dbContext.SaveChangesAsync(ct);

                    await transaction.CommitAsync(ct);

                    _logger.LogInformation(
                        "Product sync completed successfully. Processed {Count} products",
                        bulkResponse.Products.Count);

                    await _domainEventService.PublishAsync(
                        new ProductSyncCompletedEvent(
                            syncHistory.BatchId,
                            new ProductSyncMetrics(bulkResponse.Products.Count)));
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Error during product sync transaction. Rolling back.");
                    await transaction.RollbackAsync(ct);
                    throw;
                }
            });
        }
        catch (Exception ex)
        {
            var errorMessage = ex switch
            {
                HttpRequestException httpEx =>
                    $"API communication error: {httpEx.Message}",
                DbUpdateException dbEx =>
                    $"Database update error: {dbEx.Message}",
                _ => $"Unexpected error: {ex.Message}"
            };

            syncHistory.Fail(errorMessage);
            _dbContext.SyncHistory.Add(syncHistory);
            await _dbContext.SaveChangesAsync(ct);

            _logger.LogError(ex,
                "Product sync failed. BatchId: {BatchId}, Error: {Error}",
                syncHistory.BatchId,
                errorMessage);

            throw new ProductSyncException(
                "Product sync failed",
                ex);
        }
    }

    private async Task ProcessProductBatchWithRetry(
        IEnumerable<ProductDto> products,
        ProductSyncHistory syncHistory,
        CancellationToken ct)
    {
        var retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(3, retryAttempt =>
                TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning(exception,
                        "Retry {RetryCount} processing batch after {Delay}s delay",
                        retryCount, timeSpan.TotalSeconds);
                });

        await retryPolicy.ExecuteAsync(async () =>
        {
            foreach (var productDto in products)
            {
                try
                {
                    var existingProduct = await _dbContext.Products
                        .Include(p => p.Variants)
                        .Include(p => p.Images)
                        .FirstOrDefaultAsync(p => p.Id == productDto.Id, ct);

                    if (existingProduct == null)
                    {
                        await CreateProduct(productDto, ct);
                    }
                    else
                    {
                        await UpdateProduct(existingProduct, productDto, ct);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Error processing product {ProductId}",
                        productDto.Id);
                    throw;
                }
            }

            await _dbContext.SaveChangesAsync(ct);
        });
    }

    private async Task<DateTime?> GetLastSuccessfulSyncTimestamp(
        CancellationToken ct)
    {
        return await _dbContext.SyncHistory
            .Where(x => x.Status == SyncStatus.Completed)
            .OrderByDescending(x => x.CompletedAt)
            .Select(x => x.CompletedAt)
            .FirstOrDefaultAsync(ct);
    }

    private async Task UpdateProduct(Product existingProduct, ProductDto productDto, CancellationToken ct)
    {
        _mapper.Map(productDto, existingProduct);
        _dbContext.Products.Update(existingProduct);
        _logger.LogInformation("Updated existing product {ProductId}", productDto.Id);
    }

    private async Task CreateProduct(ProductDto productDto, CancellationToken ct)
    {
        var newProduct = _mapper.Map<Product>(productDto);
        await _dbContext.Products.AddAsync(newProduct, ct);
        _logger.LogInformation("Added new product {ProductId}", productDto.Id);
    }



    private async Task SyncProductAsync(AdminProductDto productDto,
        CancellationToken ct)
    {
        var existingProduct = await _dbContext.Products
            .Include(p => p.Variants)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == productDto.Id, ct);

        if (existingProduct == null)
        {
            var newProduct = _mapper.Map<Product>(productDto);
            await _dbContext.Products.AddAsync(newProduct, ct);
            _logger.LogInformation("Added new product {ProductId}", productDto.Id);
        }
        else
        {
            _mapper.Map(productDto, existingProduct);
            _dbContext.Products.Update(existingProduct);
            _logger.LogInformation("Updated existing product {ProductId}",
                productDto.Id);
        }
    }
   
    //private async Task EnsureCategoriesExist(IEnumerable<Guid> categoryIds)
    //{
    //    var existingIds = await _dbContext.Categories
    //        .Where(c => categoryIds.Contains(c.Id))
    //        .Select(c => c.Id)
    //        .ToListAsync();

    //    var missingIds = categoryIds.Except(existingIds);
    //    if (missingIds.Any())
    //    {
    //        // Option 1: Call Admin API to get category details
    //        var categoryDetails = await _adminClient.GetCategoriesAsync(missingIds);
    //        foreach (var category in categoryDetails)
    //        {
    //            await CreateOrUpdateCategory(category);
    //        }

    //    }
    //}
}

public class ProductSyncException : Exception
{
    public ProductSyncException(string productSyncFailed, Exception exception)
    {
        throw new NotImplementedException();
    }
}