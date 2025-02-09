using Store.Application.Customers.Models;

namespace Store.API.Endpoints.Customers.Models;

public class UpdateProfileRequest
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public CustomerPreferencesDto Preferences { get; init; } = new();
}

