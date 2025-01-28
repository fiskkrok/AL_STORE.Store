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

namespace Store.Infrastructure.Services;
public class ProductSyncService
{
    private readonly IAdminApiClient _adminClient;
    private readonly StoreDbContext _dbContext;
    private readonly ILogger<ProductSyncService> _logger;
    private readonly IMapper _mapper;

    public ProductSyncService(
        IAdminApiClient adminClient,
        StoreDbContext dbContext,
        IMapper mapper,
        ILogger<ProductSyncService> logger)
    {
        _adminClient = adminClient;
        _dbContext = dbContext;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task SyncProductsAsync(CancellationToken ct = default)
    {
        using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["SyncOperation"] = "ProductSync",
            ["StartedAt"] = DateTime.UtcNow
        });

        try
        {
            _logger.LogInformation("Starting product sync operation");

            // Get last sync timestamp
            var lastSync = await GetLastSuccessfulSyncTimestamp(ct);
            _logger.LogInformation("Last successful sync: {LastSync}", lastSync);

            // Get products from admin API
            var bulkResponse = await _adminClient.GetAllProductsAsync(lastSync, ct);
            _logger.LogInformation("Retrieved {Count} products from admin API",
                bulkResponse.Products.Count);

            // Begin transaction
            await using var transaction = await _dbContext.Database
                .BeginTransactionAsync(ct);

            try
            {
                var syncHistory = new ProductSyncHistory(
                    bulkResponse.BatchId,
                    DateTime.UtcNow);

                var processedCount = 0;
                foreach (var productDto in bulkResponse.Products)
                {
                    try
                    {
                        await SyncProductAsync(productDto, ct);
                        processedCount++;

                        if (processedCount % 100 == 0)
                        {
                            _logger.LogInformation("Processed {Count} products", processedCount);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex,
                            "Error processing product {ProductId}", productDto.Id);
                        // Continue with next product
                    }
                }

                syncHistory.Complete(processedCount);
                await _dbContext.SyncHistory.AddAsync(syncHistory, ct);
                await _dbContext.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);

                _logger.LogInformation(
                    "Successfully synced {Count} products from batch {BatchId}",
                    processedCount,
                    bulkResponse.BatchId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                throw new ApplicationException("Product sync failed during processing", ex);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Product sync operation failed");
            throw;
        }
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
}