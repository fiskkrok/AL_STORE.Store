using Store.Domain.Common;

namespace Store.Domain.Entities.Customer;

public class CustomerProfileUpdatedEvent : BaseDomainEvent
{
    public CustomerProfile Customer { get; }
    public CustomerProfileUpdatedEvent(CustomerProfile customer) => Customer = customer;
}