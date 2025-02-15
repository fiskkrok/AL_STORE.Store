using Store.Domain.Common;

namespace Store.Domain.Entities.Customer;

public class CustomerProfileUpdatedEvent : BaseDomainEvent
{
    public CustomerProfileUpdatedEvent(CustomerProfile customer)
    {
        Customer = customer;
    }

    public CustomerProfile Customer { get; }
}