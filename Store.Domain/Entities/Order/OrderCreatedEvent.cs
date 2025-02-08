using Store.Domain.Common;

namespace Store.Domain.Entities.Order;

public class OrderCreatedEvent : BaseDomainEvent
{
    public Order Order { get; }
    public OrderCreatedEvent(Order order) => Order = order;
}