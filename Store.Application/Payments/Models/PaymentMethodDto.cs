using Store.Application.Contracts;
using System.Text.Json.Serialization;

namespace Store.Application.Payments.Models;

public class PaymentMethodDto
{
    public string Id { get; init; } = string.Empty;
    //    public string Name { get; init; } = string.Empty;
    public bool Allowed { get; init; } = true;
    public AssetUrls AssetUrls { get; set; } = new();

    public string Identifier { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
}