using Store.Application.Payments.Models;

namespace Store.API.Endpoints.Customers.Models;

// Response Models
public class AddressResponse
{
    public AddressDto Address { get; init; } = new();
}
