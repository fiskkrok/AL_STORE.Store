using Store.Application.Customers.Models;

namespace Store.API.Endpoints.Customers.Models;
/// <summary>
/// 
/// </summary>
public class CustomerProfileResponse
{
    /// <summary>
    /// 
    /// </summary>
    public CustomerProfileDto Profile { get; init; } = new();
}