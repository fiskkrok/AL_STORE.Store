namespace Store.API.Endpoints.Payments.Models;

public class CreatePaymentSessionResponse
{
    public Guid SessionId { get; init; }
    public string ClientToken { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }

    public string OrderId { get; init; }
    public List<PaymentMethodResponse> PaymentMethods { get; init; } = new();
}