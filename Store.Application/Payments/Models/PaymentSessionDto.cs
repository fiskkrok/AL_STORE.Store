using Store.Application.Payments.Commands;

namespace Store.Application.Payments.Models;

public class PaymentSessionDto
{
    public Guid SessionId { get; init; }
    public string ClientToken { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
    public List<PaymentMethodDto> PaymentMethods { get; init; } = new();
}