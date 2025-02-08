using Store.Domain.Common;

namespace Store.Domain.Entities.Customer;

public class CustomerDefaultAddressChangedEvent : BaseDomainEvent
{
    public CustomerProfile Customer { get; }
    public CustomerAddress Address { get; }
    public CustomerDefaultAddressChangedEvent(CustomerProfile customer, CustomerAddress address)
    {
        Customer = customer;
        Address = address;
    }
}