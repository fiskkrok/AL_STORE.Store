using Store.Application.Payments.Models;

namespace Store.Application.Customers.Models;

public class CustomerProfileDto
{
    public string Id { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public bool IsVerified { get; init; }
    public string CreatedAt { get; init; } = string.Empty;
    public string? LastModified { get; init; }
    public List<AddressDto> Addresses { get; init; } = new();
    public CustomerPreferencesDto Preferences { get; init; } = new();
}