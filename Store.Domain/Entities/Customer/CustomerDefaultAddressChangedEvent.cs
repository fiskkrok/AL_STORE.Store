using Store.Domain.Common;

namespace Store.Domain.Entities.Customer;

public class CustomerDefaultAddressChangedEvent : BaseDomainEvent
{
    public CustomerDefaultAddressChangedEvent(CustomerProfile customer, CustomerAddress address)
    {
        Customer = customer;
        Address = address;
    }

    public CustomerProfile Customer { get; }
    public CustomerAddress Address { get; }
}