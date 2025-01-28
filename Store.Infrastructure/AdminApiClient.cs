using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Store.Application.Products.Models;


namespace Store.Infrastructure;

public interface IAdminApiClient
{
    Task<BulkProductsResponse> GetAllProductsAsync(
        DateTime? since = null,
        CancellationToken ct = default);
}

public class AdminApiClient : IAdminApiClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AdminApiClient> _logger;

    public AdminApiClient(
        HttpClient httpClient,
        ILogger<AdminApiClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<BulkProductsResponse> GetAllProductsAsync(
        DateTime? since = null,
        CancellationToken ct = default)
    {
        try
        {
            var url = since.HasValue
                ? $"api/products/bulk?since={since.Value:O}"
                : "api/products/bulk";

            var response = await _httpClient.GetFromJsonAsync<BulkProductsResponse>(
                url, ct);

            return response
                   ?? throw new InvalidOperationException("Failed to get products");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting products from Admin API");
            throw;
        }
    }
}



public record BulkProductsResponse
{
    public string BatchId { get; init; } = string.Empty;
    public List<AdminProductDto> Products { get; init; } = new();
    public DateTime Timestamp { get; init; }
    public int TotalCount { get; init; }
}

public class AdminApiException : Exception
{
    public HttpStatusCode StatusCode { get; }

    public AdminApiException(
        string message,
        HttpStatusCode statusCode,
        Exception? innerException = null)
        : base(message, innerException)
    {
        StatusCode = statusCode;
    }
}