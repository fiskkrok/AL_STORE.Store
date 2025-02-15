using Store.Domain.Common;

namespace Store.Domain.Entities.Customer;

public class CustomerVerifiedEvent : BaseDomainEvent
{
    public CustomerVerifiedEvent(CustomerProfile customer)
    {
        Customer = customer;
    }

    public CustomerProfile Customer { get; }
}