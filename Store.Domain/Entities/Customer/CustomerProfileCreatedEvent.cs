using Store.Domain.Common;

namespace Store.Domain.Entities.Customer;

public class CustomerProfileCreatedEvent : BaseDomainEvent
{
    public CustomerProfileCreatedEvent(CustomerProfile customer)
    {
        Customer = customer;
    }

    public CustomerProfile Customer { get; }
}