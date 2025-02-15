namespace Store.Application.Payments.Models;

public class AddressDto
{
    public string Id { get; init; } = string.Empty;
    public string Street { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public string Type { get; set; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string StreetNumber { get; init; } = string.Empty;
    public string? Apartment { get; init; }
    public string? Phone { get; init; }
    public bool IsDefault { get; init; }
}