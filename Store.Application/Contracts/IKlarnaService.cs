using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Text.Json;
using System.Threading.Tasks;

using Store.Domain.Common;
using Store.Domain.Entities.Order;

namespace Store.Application.Contracts;
public interface IKlarnaService
{
    Task<Result<KlarnaSessionResponse>> CreateSessionAsync(
        Order order,
        string locale,
        CancellationToken ct = default);

    Task<Result<string>> AuthorizePaymentAsync(
        string sessionId,
        string authToken,
        CancellationToken ct = default);

    Task<Result<bool>> CapturePaymentAsync(
        string klarnaOrderId,
        CancellationToken ct = default);
}

//public class KlarnaSessionResponse
//{
//    public string ClientToken { get; init; } = string.Empty;
//    public string SessionId { get; init; } = string.Empty;
//    public List<KlarnaPaymentMethod> PaymentMethods { get; init; } = new();
//}
public class KlarnaPaymentMethod
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public bool Allowed { get; init; }
}
public class KlarnaSessionResponse
{
    [JsonPropertyName("client_token")]
    public string ClientToken { get; set; } = string.Empty;

    [JsonPropertyName("payment_method_categories")]
    public List<PaymentMethodCategory> PaymentMethodCategories { get; set; } = new();

    [JsonPropertyName("session_id")]
    public string SessionId { get; set; } = string.Empty;

    public static KlarnaSessionResponse? FromJson(string json) =>
        JsonSerializer.Deserialize<KlarnaSessionResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

    public string ToJson() =>
        JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true });
}

public class PaymentMethodCategory
{
    [JsonPropertyName("asset_urls")]
    public AssetUrls AssetUrls { get; set; } = new();

    [JsonPropertyName("identifier")]
    public string Identifier { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

public class AssetUrls
{
    [JsonPropertyName("descriptive")]
    public string Descriptive { get; set; } = string.Empty;

    [JsonPropertyName("standard")]
    public string Standard { get; set; } = string.Empty;
}