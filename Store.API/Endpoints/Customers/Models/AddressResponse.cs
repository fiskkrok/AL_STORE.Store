using Store.Application.Payments.Models;

namespace Store.API.Endpoints.Customers.Models;

/// <summary>
/// 
/// </summary>
public class AddressResponse
{
    /// <summary>
    /// 
    /// </summary>
    public AddressDto Address { get; init; } = new();
}