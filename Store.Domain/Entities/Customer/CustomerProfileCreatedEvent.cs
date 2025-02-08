using Store.Domain.Common;

namespace Store.Domain.Entities.Customer;

public class CustomerProfileCreatedEvent : BaseDomainEvent
{
    public CustomerProfile Customer { get; }
    public CustomerProfileCreatedEvent(CustomerProfile customer) => Customer = customer;
}