using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using Store.Application.Products.Models;
using Store.Domain.Entities.Product;
using Store.Domain.Enums;
using Store.Domain.ValueObjects;
using Store.Infrastructure.Persistence;
using Store.Infrastructure.Services.Models;

namespace Store.Infrastructure.Services;

public class ProductSyncService(
    ILogger<ProductSyncService> logger,
    StoreDbContext dbContext,
    IAdminApiClient adminClient,
    IDomainEventService domainEventService,
    IMapper mapper)
{
    public async Task SyncProductsAsync(CancellationToken ct = default)
    {
        var syncHistory = new ProductSyncHistory(
            Guid.NewGuid().ToString(),
            DateTime.UtcNow);

        try
        {
            logger.LogInformation("Starting product sync. BatchId: {BatchId}", syncHistory.BatchId);

            var strategy = dbContext.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await dbContext.Database.BeginTransactionAsync(ct);
                try
                {
                    var lastSync = await GetLastSuccessfulSyncTimestamp(ct);
                    var bulkResponse = await adminClient.GetAllProductsAsync(lastSync, ct);

                    // Process in batches to avoid memory issues
                    foreach (var batch in bulkResponse.Products.Chunk(100))
                    {
                        await ProcessProductBatch(mapper.Map<IEnumerable<ProductDto>>(batch), ct);
                        logger.LogInformation("Processed batch of {Count} products", batch.Length);
                    }

                    syncHistory.Complete(bulkResponse.Products.Count);
                    dbContext.SyncHistory.Add(syncHistory);
                    await dbContext.SaveChangesAsync(ct);

                    await transaction.CommitAsync(ct);

                    logger.LogInformation("Product sync completed. BatchId: {BatchId}", syncHistory.BatchId);
                    await domainEventService.PublishAsync(
                        new ProductSyncCompletedEvent(syncHistory.BatchId, new ProductSyncMetrics(bulkResponse.Products.Count)));
                }

                catch (Exception ex)
                {
                    logger.LogError(ex, "Error during product sync transaction");
                    await transaction.RollbackAsync(ct);
                    throw;
                }
            });
        }
        catch (Exception ex)
        {
            syncHistory.Fail(ex.Message);
            dbContext.SyncHistory.Add(syncHistory);
            await dbContext.SaveChangesAsync(ct);

            logger.LogError(ex,
                "Product sync failed. BatchId: {BatchId}, Error: {Error}",
                syncHistory.BatchId,
                ex.Message);

            throw new ProductSyncException("Product sync failed", ex);
        }
    }

    private async Task ProcessProductBatch(IEnumerable<ProductDto> products, CancellationToken ct)
    {
        foreach (var productDto in products)
        {
            var existingProduct = await dbContext.Products
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

        await dbContext.SaveChangesAsync(ct);
    }

    private async Task UpdateProduct(Product existingProduct, ProductDto productDto, CancellationToken ct)
    {
        mapper.Map(productDto, existingProduct);
        dbContext.Products.Update(existingProduct);
        logger.LogInformation("Updated existing product {ProductId}", productDto.Id);
    }

    private async Task CreateProduct(ProductDto productDto, CancellationToken ct)
    {
        var newProduct = mapper.Map<Product>(productDto);
        await dbContext.Products.AddAsync(newProduct, ct);
        logger.LogInformation("Added new product {ProductId}", productDto.Id);
    }


    private async Task<DateTime?> GetLastSuccessfulSyncTimestamp(
        CancellationToken ct)
    {
        return await dbContext.SyncHistory
            .Where(x => x.Status == SyncStatus.Completed)
            .OrderByDescending(x => x.CompletedAt)
            .Select(x => x.CompletedAt)
            .FirstOrDefaultAsync(ct);
    }

    private async Task SyncProductAsync(AdminProductDto productDto,
        CancellationToken ct)
    {
        var existingProduct = await dbContext.Products
            .Include(p => p.Variants)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == productDto.Id, ct);

        if (existingProduct == null)
        {
            var newProduct = mapper.Map<Product>(productDto);
            await dbContext.Products.AddAsync(newProduct, ct);
            logger.LogInformation("Added new product {ProductId}", productDto.Id);
        }
        else
        {
            mapper.Map(productDto, existingProduct);
            dbContext.Products.Update(existingProduct);
            logger.LogInformation("Updated existing product {ProductId}",
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