namespace Store.API.Endpoints.Payments.Models;

public class CustomerRequest
{
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public AddressRequest? ShippingAddress { get; init; }
}