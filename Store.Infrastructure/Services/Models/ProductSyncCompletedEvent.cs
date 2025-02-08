using Store.Domain.Common;

namespace Store.Infrastructure.Services.Models;

public class ProductSyncCompletedEvent : BaseDomainEvent
{
    public string BatchId { get; }
    public ProductSyncMetrics Metrics { get; }

    public ProductSyncCompletedEvent(string batchId, ProductSyncMetrics metrics)
    {
        BatchId = batchId;
        Metrics = metrics;
    }
}