using Store.Application.Common.Models;
using Store.Domain.Enums;

namespace Store.Application.Mappings;

public class SyncHistoryDto : BaseDto
{
    public string BatchId { get; init; } = string.Empty;
    public DateTime StartedAt { get; init; }
    public DateTime CompletedAt { get; init; }
    public int ProductCount { get; init; }
    public SyncStatus Status { get; init; }
    public string? ErrorMessage { get; init; }
}