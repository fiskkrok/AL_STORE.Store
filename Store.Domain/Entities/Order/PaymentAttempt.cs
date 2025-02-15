using Store.Domain.Common;
using Store.Domain.Enums;

namespace Store.Domain.Entities.Order;

public class PaymentAttempt : BaseEntity
{
    private PaymentAttempt()
    {
    } // For EF Core

    public PaymentAttempt(Guid orderId, Guid paymentSessionId)
    {
        OrderId = orderId;
        PaymentSessionId = paymentSessionId;
        AttemptedAt = DateTime.UtcNow;
        Status = PaymentStatus.Pending;
    }

    public Guid OrderId { get; private set; }
    public Guid PaymentSessionId { get; private set; }
    public DateTime AttemptedAt { get; private set; }
    public PaymentStatus Status { get; private set; }
    public string? ErrorMessage { get; private set; }

    public void SetSuccess()
    {
        Status = PaymentStatus.Successful;
    }

    public void SetFailure(string error)
    {
        Status = PaymentStatus.Failed;
        ErrorMessage = error;
    }
}