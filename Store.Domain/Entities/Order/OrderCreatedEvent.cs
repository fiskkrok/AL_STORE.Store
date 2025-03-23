using Store.Domain.Common;

namespace Store.Domain.Entities.Order;

public class OrderCreatedEvent : BaseDomainEvent
{
    public OrderCreatedEvent(Order order, string customerName, string customerEmail)
    {
        Order = order;
        CustomerName = customerName;
        CustomerEmail = customerEmail;
    }

    public Order Order { get; }
    public string CustomerName { get; }
    public string CustomerEmail { get; }
}
