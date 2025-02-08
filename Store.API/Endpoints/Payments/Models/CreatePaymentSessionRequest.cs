namespace Store.API.Endpoints.Payments.Models;

public class CreatePaymentSessionRequest
{
    public List<OrderLineRequest> Items { get; init; } = new();
    public string Currency { get; init; } = "SEK";
    public string Locale { get; init; } = "sv-SE";
    public CustomerRequest Customer { get; init; } = new();
}