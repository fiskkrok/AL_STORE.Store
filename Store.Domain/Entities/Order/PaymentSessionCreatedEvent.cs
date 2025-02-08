using Store.Domain.Common;

namespace Store.Domain.Entities.Order;

public class PaymentSessionCreatedEvent : BaseDomainEvent
{
    public PaymentSession Session { get; }
    public PaymentSessionCreatedEvent(PaymentSession session) => Session = session;
}