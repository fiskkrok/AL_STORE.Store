using Store.Domain.Common;

namespace Store.Domain.Entities.Order;

public class PaymentSessionAuthorizedEvent : BaseDomainEvent
{
    public PaymentSession Session { get; }
    public PaymentSessionAuthorizedEvent(PaymentSession session) => Session = session;
}