using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Store.Domain.ValueObjects;
using Store.Infrastructure.Caching;
using System.Threading.Channels;
using Microsoft.Extensions.Caching.Hybrid;
using Store.Application.Common.Interfaces;
using Azure;

namespace Store.Infrastructure.BackgroundJobs;

public class CacheInvalidationJob : BackgroundService
{
    private readonly ILogger<CacheInvalidationJob> _logger;
    private readonly HybridCache _cache;
    private readonly IServiceProvider _serviceProvider;
    private readonly Channel<CacheInvalidationEvent> _channel;

    public CacheInvalidationJob(
        ILogger<CacheInvalidationJob> logger,
        HybridCache cache,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _cache = cache;
        _serviceProvider = serviceProvider;
        _channel = Channel.CreateUnbounded<CacheInvalidationEvent>(new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false
        });
    }

    public async Task EnqueueInvalidationEventAsync(CacheInvalidationEvent invalidationEvent)
    {
        await _channel.Writer.WriteAsync(invalidationEvent);
        _logger.LogInformation(
            "Cache invalidation event enqueued: {EventType} for {EntityId}",
            invalidationEvent.GetType().Name,
            invalidationEvent.EntityId);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await foreach (var invalidationEvent in _channel.Reader.ReadAllAsync(stoppingToken))
            {
                try
                {
                    await ProcessInvalidationEventAsync(invalidationEvent, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error processing cache invalidation event: {EventType} for {EntityId}",
                        invalidationEvent.GetType().Name,
                        invalidationEvent.EntityId);
                }
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Operation was canceled.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception in ExecuteAsync.");
        }
    }

    private async Task ProcessInvalidationEventAsync(
        CacheInvalidationEvent invalidationEvent,
        CancellationToken cancellationToken)
    {
        switch (invalidationEvent)
        {
            case ProductUpdatedEvent productEvent:
                await InvalidateProductCacheAsync(productEvent.EntityId);
                break;

            case CategoryUpdatedEvent categoryEvent:
                await InvalidateCategoryCacheAsync(categoryEvent.EntityId);
                break;

            case PriceUpdatedEvent priceEvent:
                await InvalidateProductPriceCacheAsync(priceEvent.EntityId, priceEvent.NewPrice);
                break;

            default:
                _logger.LogWarning(
                    "Unknown cache invalidation event type: {EventType}",
                    invalidationEvent.GetType().Name);
                break;
        }
    }

    private async Task InvalidateProductCacheAsync(Guid productId)
    {
        // Invalidate specific product cache
        await _cache.RemoveAsync($"products:detail:{productId}");

        // Invalidate product list caches
        const string tag = "products:list:*";
        await _cache.RemoveByTagAsync(tag);
        
    }

    private async Task InvalidateCategoryCacheAsync(Guid categoryId)
    {
        await _cache.RemoveAsync("categories:list");

        // Invalidate product lists that might be filtered by this category
        const string tag = "products:list:*";
        await _cache.RemoveByTagAsync(tag);
     
    }

    private async Task InvalidateProductPriceCacheAsync(Guid productId, Money newPrice)
    {
        await InvalidateProductCacheAsync(productId);

        // Additional price-specific cache invalidation if needed
        // For example, invalidating price range caches
        await _cache.RemoveAsync("products:price:ranges");
    }
}

public abstract record CacheInvalidationEvent
{
    public Guid EntityId { get; }
    public DateTime Timestamp { get; }

    protected CacheInvalidationEvent(Guid entityId)
    {
        EntityId = entityId;
        Timestamp = DateTime.UtcNow;
    }
}

public record ProductUpdatedEvent(Guid EntityId) : CacheInvalidationEvent(EntityId);
public record CategoryUpdatedEvent(Guid EntityId) : CacheInvalidationEvent(EntityId);
public record PriceUpdatedEvent(Guid EntityId, Money NewPrice) : CacheInvalidationEvent(EntityId);