using Store.Application.Contracts;

namespace Store.API.Endpoints.Payments.Models;

/// <summary>
/// </summary>
public class PaymentMethodResponse
{
    /// <summary>
    /// </summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// </summary>
    public bool Allowed { get; init; }

    public AssetUrls AssetUrls { get; init; }
}