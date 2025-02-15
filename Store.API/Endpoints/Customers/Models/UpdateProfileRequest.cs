using Store.Application.Customers.Models;

namespace Store.API.Endpoints.Customers.Models;

/// <summary>
/// </summary>
public class UpdateProfileRequest
{
    /// <summary>
    /// </summary>
    public string FirstName { get; init; } = string.Empty;

    /// <summary>
    /// </summary>
    public string LastName { get; init; } = string.Empty;

    /// <summary>
    /// </summary>
    public string? Phone { get; init; }

    /// <summary>
    /// </summary>
    public CustomerPreferencesDto Preferences { get; init; } = new();
}