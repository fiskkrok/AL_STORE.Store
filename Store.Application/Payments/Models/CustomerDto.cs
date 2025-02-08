
namespace Store.Application.Payments.Models;

public class CustomerDto
{
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public AddressDto? ShippingAddress { get; init; }
}