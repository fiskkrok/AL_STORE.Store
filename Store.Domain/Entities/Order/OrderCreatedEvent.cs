using Store.Domain.Common;

namespace Store.Domain.Entities.Order;

public class OrderCreatedEvent : BaseDomainEvent
{
    public OrderCreatedEvent(Order order)
    {
        Order = order;
    }

    public Order Order { get; }
}