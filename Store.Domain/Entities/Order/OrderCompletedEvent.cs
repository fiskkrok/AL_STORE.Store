using Store.Domain.Common;

namespace Store.Domain.Entities.Order;

public class OrderCompletedEvent : BaseDomainEvent
{
    public Order Order { get; }
    public OrderCompletedEvent(Order order) => Order = order;
}