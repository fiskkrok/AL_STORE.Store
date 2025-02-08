using AutoMapper;
using Store.Domain.Entities.Customer;

namespace Store.Application.Customers.Models;

public class CustomerProfileDto
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public bool IsVerified { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? LastModified { get; init; }
}

public class AddressDto
{
    public Guid Id { get; init; }
    public string Street { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
    public string Type { get; init; } = string.Empty;
}


