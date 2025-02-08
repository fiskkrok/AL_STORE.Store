using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Infrastructure.Services.Models;
public class ProductSyncMetrics(int productsCount)
{
    public string BatchId { get; }
    public DateTime StartTime { get; }
    public DateTime? EndTime { get; private set; }
    public int ProcessedCount { get; private set; }
    public int SuccessCount { get; private set; }
    public int ErrorCount { get; private set; }
    public Dictionary<string, int> ErrorTypes { get; } = new();

    public TimeSpan? Duration => EndTime?.Subtract(StartTime);

    public void RecordSuccess()
    {
        ProcessedCount++;
        SuccessCount++;
    }

    public void RecordError(string errorType)
    {
        ProcessedCount++;
        ErrorCount++;
        ErrorTypes[errorType] = ErrorTypes.GetValueOrDefault(errorType) + 1;
    }

    public void Complete()
    {
        EndTime = DateTime.UtcNow;
    }
}