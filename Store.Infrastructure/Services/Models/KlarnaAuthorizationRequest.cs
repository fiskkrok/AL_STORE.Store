using System.Text.Json.Serialization;

namespace Store.Infrastructure.Services.Models;

public class KlarnaAuthorizationRequest
{
    public string AuthToken { get; init; } = string.Empty;
    [JsonPropertyName("purchase_country")] public string PurchaseCountry { get; set; }
    [JsonPropertyName("purchase_currency")] public string PurchaseCurrency { get; set; }
    [JsonPropertyName("order_amount")] public long OrderAmount { get; set; }
    [JsonPropertyName("order_lines")] public List<KlarnaOrderLine> OrderLines { get; set; }
}