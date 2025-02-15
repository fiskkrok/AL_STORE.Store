using Store.Domain.Common;

namespace Store.Domain.Entities.Order;

public class OrderCompletedEvent : BaseDomainEvent
{
    public OrderCompletedEvent(Order order)
    {
        Order = order;
    }

    public Order Order { get; }
}