using Store.Domain.Entities.Customer;

namespace Store.Application.Payments.Models;

public class AddressDto
{
    public string Street { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public Guid Id { get; set; }
    public bool IsDefault { get; set; }
    public string Type { get; set; }
}