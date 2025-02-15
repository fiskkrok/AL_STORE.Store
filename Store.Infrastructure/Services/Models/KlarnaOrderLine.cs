using System.Text.Json.Serialization;

namespace Store.Infrastructure.Services.Models;

public class KlarnaOrderLine
{
    public string Name { get; init; } = string.Empty;
    public string Reference { get; init; } = string.Empty;
    public int Quantity { get; init; }

    [JsonPropertyName("unit_price")] public long UnitPrice { get; init; }

    [JsonPropertyName("total_amount")] public long TotalAmount { get; init; }
}