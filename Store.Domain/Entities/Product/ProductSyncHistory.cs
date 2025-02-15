using Store.Domain.Common;
using Store.Domain.Enums;

namespace Store.Domain.Entities.Product;

public class ProductSyncHistory : BaseEntity
{
    private ProductSyncHistory()
    {
    }

    public ProductSyncHistory(
        string batchId,
        DateTime startedAt)
    {
        BatchId = batchId;
        StartedAt = startedAt;
        Status = SyncStatus.Processing;
    }

    public string BatchId { get; private set; } = string.Empty;
    public DateTime StartedAt { get; private set; }
    public DateTime CompletedAt { get; private set; }
    public int ProductCount { get; private set; }
    public SyncStatus Status { get; private set; }
    public string? ErrorMessage { get; private set; }

    public void Complete(int productCount)
    {
        Status = SyncStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        ProductCount = productCount;
    }

    public void Fail(string error)
    {
        Status = SyncStatus.Failed;
        CompletedAt = DateTime.UtcNow;
        ErrorMessage = error;
    }
}