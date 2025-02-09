using Store.Application.Customers.Models;

namespace Store.API.Endpoints.Customers.Models;

public class CustomerProfileResponse
{
    public CustomerProfileDto Profile { get; init; } = new();
}