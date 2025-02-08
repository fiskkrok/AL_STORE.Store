namespace Store.Infrastructure.Services.Models;

public class IdempotencyRecord
{
    public DateTime ProcessedAt { get; init; }
    public DateTime ExpiresAt { get; init; }
}