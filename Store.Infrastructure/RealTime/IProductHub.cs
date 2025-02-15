using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Store.Application.Common.Interfaces;

namespace Store.Infrastructure.RealTime;

public interface IProductHub
{
    Task OnStockUpdate(StockUpdate update);
    Task OnPriceUpdate(PriceUpdate update);
}

public class ProductHub : Hub<IProductHub>
{
    private readonly ILogger<ProductHub> _logger;

    public ProductHub(ILogger<ProductHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}

public interface IProductUpdateService
{
    Task PublishStockUpdate(StockUpdate update);
    Task PublishPriceUpdate(PriceUpdate update);
    Task InvalidateProductCache(Guid productId);
}

public class ProductUpdateService : IProductUpdateService
{
    private readonly ICacheService _cache;
    private readonly IHubContext<ProductHub, IProductHub> _hubContext;
    private readonly ILogger<ProductUpdateService> _logger;

    public ProductUpdateService(
        IHubContext<ProductHub, IProductHub> hubContext,
        ICacheService cache,
        ILogger<ProductUpdateService> logger)
    {
        _hubContext = hubContext;
        _cache = cache;
        _logger = logger;
    }

    public async Task PublishStockUpdate(StockUpdate update)
    {
        try
        {
            await _hubContext.Clients.All.OnStockUpdate(update);
            await InvalidateProductCache(update.ProductId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing stock update");
        }
    }

    public async Task PublishPriceUpdate(PriceUpdate update)
    {
        try
        {
            await _hubContext.Clients.All.OnPriceUpdate(update);
            await InvalidateProductCache(update.ProductId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing price update");
        }
    }

    public async Task InvalidateProductCache(Guid productId)
    {
        await _cache.RemoveAsync($"products:detail:{productId}");
        // Note: List cache invalidation handled by background job
    }
}

public record StockUpdate(
    Guid ProductId,
    Guid? VariantId,
    int NewStockLevel,
    DateTime Timestamp);

public record PriceUpdate(
    Guid ProductId,
    Guid? VariantId,
    decimal NewPrice,
    decimal OldPrice,
    DateTime Timestamp);