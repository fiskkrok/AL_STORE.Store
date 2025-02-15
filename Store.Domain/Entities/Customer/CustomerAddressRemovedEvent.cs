using Store.Domain.Common;

namespace Store.Domain.Entities.Customer;

public class CustomerAddressRemovedEvent : BaseDomainEvent
{
    public CustomerAddressRemovedEvent(CustomerProfile customer, CustomerAddress address)
    {
        Customer = customer;
        Address = address;
    }

    public CustomerProfile Customer { get; }
    public CustomerAddress Address { get; }
}