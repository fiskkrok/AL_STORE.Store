using Store.Domain.Common;

namespace Store.Domain.Entities.Order;

public class PaymentSessionCreatedEvent : BaseDomainEvent
{
    public PaymentSessionCreatedEvent(PaymentSession session)
    {
        Session = session;
    }

    public PaymentSession Session { get; }
}