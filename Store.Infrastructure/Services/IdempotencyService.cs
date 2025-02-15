using System.Text.Json;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using Store.Application.Contracts;
using Store.Infrastructure.Services.Exceptions;
using Store.Infrastructure.Services.Models;

namespace Store.Infrastructure.Services;

public class IdempotencyService : IIdempotencyService
{
    private const string KeyPrefix = "idempotency:";
    private static readonly TimeSpan KeyExpiry = TimeSpan.FromDays(7); // Configure as needed
    private readonly ILogger<IdempotencyService> _logger;
    private readonly IConnectionMultiplexer _redis;

    public IdempotencyService(
        IConnectionMultiplexer redis,
        ILogger<IdempotencyService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async Task<bool> IsOperationProcessedAsync(string key, CancellationToken ct = default)
    {
        try
        {
            var db = _redis.GetDatabase();
            var result = await db.StringGetAsync($"{KeyPrefix}{key}");

            return result.HasValue;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking idempotency key {Key}", key);
            // In case of Redis failure, we err on the side of caution and process the operation
            return false;
        }
    }

    public async Task MarkOperationAsProcessedAsync(string key, CancellationToken ct = default)
    {
        try
        {
            var db = _redis.GetDatabase();
            var value = new IdempotencyRecord
            {
                ProcessedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.Add(KeyExpiry)
            };

            await db.StringSetAsync(
                $"{KeyPrefix}{key}",
                JsonSerializer.Serialize(value),
                KeyExpiry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking idempotency key {Key} as processed", key);
            throw new IdempotencyException("Failed to mark operation as processed", ex);
        }
    }

    public async Task<IdempotencyRecord?> GetOperationDetailsAsync(string key, CancellationToken ct = default)
    {
        try
        {
            var db = _redis.GetDatabase();
            var result = await db.StringGetAsync($"{KeyPrefix}{key}");

            if (!result.HasValue)
                return null;

            return JsonSerializer.Deserialize<IdempotencyRecord>(result.ToString());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting idempotency details for key {Key}", key);
            return null;
        }
    }
}