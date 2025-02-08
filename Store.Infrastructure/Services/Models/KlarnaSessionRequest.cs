using System.Text.Json.Serialization;

namespace Store.Infrastructure.Services.Models;

public class KlarnaSessionRequest
{
    [JsonPropertyName("purchase_country")]
    public string PurchaseCountry { get; init; } = string.Empty;

    [JsonPropertyName("order_amount")]
    public long PurchaseAmount { get; init; }

    [JsonPropertyName("purchase_currency")]
    public string PurchaseCurrency { get; init; } = string.Empty;

    [JsonPropertyName("locale")]
    public string Locale { get; init; } = string.Empty;

    [JsonPropertyName("order_lines")]
    public List<KlarnaOrderLine> OrderLines { get; init; } = new();

    [JsonPropertyName("merchant_urls")]
    public KlarnaMerchantUrls MerchantUrls { get; init; } = new();

    [JsonPropertyName("intent")]
    public string Intent { get; set; } = "buy";
}