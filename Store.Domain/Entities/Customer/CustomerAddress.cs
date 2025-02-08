using Store.Domain.Common;
using Store.Domain.ValueObjects;

namespace Store.Domain.Entities.Customer;

public class CustomerAddress : BaseEntity
{
    public Guid CustomerId { get; private set; }
    public Address Address { get; private set; }
    public AddressType Type { get; private set; }
    public bool IsDefault { get; private set; }

    private CustomerAddress() { } // For EF Core

    public CustomerAddress(
        Guid customerId,
        Address address,
        AddressType type,
        bool isDefault = false)
    {
        CustomerId = customerId;
        Address = address;
        Type = type;
        IsDefault = isDefault;
    }

    public void Update(Address address)
    {
        Address = address;
    }

    public void SetDefault()
    {
        IsDefault = true;
    }

    public void ClearDefault()
    {
        IsDefault = false;
    }
}