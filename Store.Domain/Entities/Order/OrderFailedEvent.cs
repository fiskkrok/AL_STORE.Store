using Store.Domain.Common;

namespace Store.Domain.Entities.Order;

public class OrderFailedEvent : BaseDomainEvent
{
    public Guid OrderId { get; }
    public string Reason { get; }
    public OrderFailedEvent(Guid orderId, string reason)
    {
        OrderId = orderId;
        Reason = reason;
    }
}