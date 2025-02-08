namespace Store.API.Endpoints.Payments.Models;

public class PaymentMethodResponse
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public bool Allowed { get; init; }
}