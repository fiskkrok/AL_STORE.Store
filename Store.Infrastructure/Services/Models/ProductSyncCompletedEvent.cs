using Store.Domain.Common;

namespace Store.Infrastructure.Services.Models;

public class ProductSyncCompletedEvent : BaseDomainEvent
{
    public ProductSyncCompletedEvent(string batchId, ProductSyncMetrics metrics)
    {
        BatchId = batchId;
        Metrics = metrics;
    }

    public string BatchId { get; }
    public ProductSyncMetrics Metrics { get; }
}