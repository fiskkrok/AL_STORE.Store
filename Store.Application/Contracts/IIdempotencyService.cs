namespace Store.Application.Contracts;

public interface IIdempotencyService
{
    Task<bool> IsOperationProcessedAsync(string key, CancellationToken ct = default);
    Task MarkOperationAsProcessedAsync(string key, CancellationToken ct = default);
}

