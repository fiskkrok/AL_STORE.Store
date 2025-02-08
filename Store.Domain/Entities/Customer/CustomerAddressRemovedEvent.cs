using Store.Domain.Common;

namespace Store.Domain.Entities.Customer;

public class CustomerAddressRemovedEvent : BaseDomainEvent
{
    public CustomerProfile Customer { get; }
    public CustomerAddress Address { get; }
    public CustomerAddressRemovedEvent(CustomerProfile customer, CustomerAddress address)
    {
        Customer = customer;
        Address = address;
    }
}