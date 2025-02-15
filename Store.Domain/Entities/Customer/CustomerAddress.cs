using Store.Domain.Common;

namespace Store.Domain.Entities.Customer;

public class CustomerAddress : BaseEntity
{
    private CustomerAddress()
    {
    } // For EF Core

    public CustomerAddress(
        Guid customerId,
        AddressType type,
        string firstName,
        string lastName,
        string street,
        string streetNumber,
        string? apartment,
        string postalCode,
        string city,
        string state,
        string country,
        string? phone,
        bool isDefault = false)
    {
        CustomerId = customerId;
        Type = type;
        FirstName = firstName;
        LastName = lastName;
        Street = street;
        StreetNumber = streetNumber;
        Apartment = apartment;
        PostalCode = postalCode;
        City = city;
        State = state;
        Country = country;
        Phone = phone;
        IsDefault = isDefault;
    }

    public Guid CustomerId { get; private set; }
    public AddressType Type { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string Street { get; private set; }
    public string StreetNumber { get; private set; }
    public string? Apartment { get; private set; }
    public string PostalCode { get; private set; }
    public string City { get; private set; }
    public string State { get; private set; }
    public string Country { get; private set; }
    public string? Phone { get; private set; }
    public bool IsDefault { get; private set; }

    public void Update(
        string firstName,
        string lastName,
        string street,
        string streetNumber,
        string? apartment,
        string postalCode,
        string city,
        string state,
        string country,
        string? phone)
    {
        FirstName = firstName;
        LastName = lastName;
        Street = street;
        StreetNumber = streetNumber;
        Apartment = apartment;
        PostalCode = postalCode;
        City = city;
        State = state;
        Country = country;
        Phone = phone;
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