using Store.Domain.Common;
using Store.Domain.Exceptions;
using Store.Domain.ValueObjects;

namespace Store.Domain.Entities.Customer;

public class CustomerProfile : BaseAuditableEntity
{
    private readonly List<CustomerAddress> _addresses = new();

    public string UserId { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public Email Email { get; private set; }
    public PhoneNumber? Phone { get; private set; }
    public bool IsVerified { get; private set; }
    public CustomerPreferences Preferences { get; private set; }
    public IReadOnlyCollection<CustomerAddress> Addresses => _addresses.AsReadOnly();

    private CustomerProfile() { } // For EF Core

    public CustomerProfile(
        string userId,
        string firstName,
        string lastName,
        string email,
        string? phone = null)
    {
        var emailResult = Email.Create(email);
        if (!emailResult.IsSuccess)
            throw new DomainException($"Invalid email: {string.Join(", ", emailResult.Errors)}");

        PhoneNumber? phoneNumber = null;
        if (!string.IsNullOrEmpty(phone))
        {
            var phoneResult = PhoneNumber.Create(phone);
            if (!phoneResult.IsSuccess)
                throw new DomainException($"Invalid phone: {string.Join(", ", phoneResult.Errors)}");
            phoneNumber = phoneResult.Value;
        }

        UserId = userId;
        FirstName = firstName;
        LastName = lastName;
        Email = emailResult.Value!;
        Phone = phoneNumber;
        IsVerified = false;
        Preferences = new CustomerPreferences(); // Default preferences

        AddDomainEvent(new CustomerProfileCreatedEvent(this));
    }

    public void Update(
        string firstName,
        string lastName,
        string? phone,
        CustomerPreferences preferences)
    {
        FirstName = firstName;
        LastName = lastName;

        if (phone != null)
        {
            var phoneResult = PhoneNumber.Create(phone);
            if (!phoneResult.IsSuccess)
                throw new DomainException($"Invalid phone: {string.Join(", ", phoneResult.Errors)}");
            Phone = phoneResult.Value;
        }

        Preferences = preferences;
        AddDomainEvent(new CustomerProfileUpdatedEvent(this));
    }

    public void AddAddress(CustomerAddress address)
    {
        if (address.IsDefault)
        {
            // Clear default flag for other addresses of the same type
            var existingDefault = _addresses.FirstOrDefault(a =>
                a.Type == address.Type && a.IsDefault);

            if (existingDefault != null)
                existingDefault.ClearDefault();
        }

        _addresses.Add(address);
        AddDomainEvent(new CustomerAddressAddedEvent(this, address));
    }

    public void RemoveAddress(CustomerAddress address)
    {
        if (_addresses.Count == 1)
            throw new DomainException("Cannot remove the only address");

        _addresses.Remove(address);
        AddDomainEvent(new CustomerAddressRemovedEvent(this, address));
    }

    public void SetAddressAsDefault(CustomerAddress address)
    {
        var existingDefault = _addresses.FirstOrDefault(a =>
            a.Type == address.Type && a.IsDefault);

        if (existingDefault != null)
            existingDefault.ClearDefault();

        address.SetDefault();
        AddDomainEvent(new CustomerDefaultAddressChangedEvent(this, address));
    }

    public void Verify()
    {
        if (!IsVerified)
        {
            IsVerified = true;
            AddDomainEvent(new CustomerVerifiedEvent(this));
        }
    }
}
