using Store.Domain.Common;

namespace Store.Domain.Entities.Customer;

public class CustomerVerifiedEvent : BaseDomainEvent
{
    public CustomerProfile Customer { get; }
    public CustomerVerifiedEvent(CustomerProfile customer) => Customer = customer;
}