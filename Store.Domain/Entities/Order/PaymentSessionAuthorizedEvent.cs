using Store.Domain.Common;

namespace Store.Domain.Entities.Order;

public class PaymentSessionAuthorizedEvent : BaseDomainEvent
{
    public PaymentSessionAuthorizedEvent(PaymentSession session)
    {
        Session = session;
    }

    public PaymentSession Session { get; }
}