using Store.Application.Common.Models;
using Store.Application.Payments.Models;

namespace Store.Application.Orders.Models;

public class OrderDetailDto : BaseDto
{
    public string OrderNumber { get; init; } = string.Empty;
    public DateTime Created { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public AddressDto BillingAddress { get; init; } = new();
    public AddressDto ShippingAddress { get; init; } = new();
    public List<OrderLineItemDto> Items { get; init; } = new();
}

public class OrderLineItemDto
{
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? Sku { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal LineTotal { get; init; }
    public string Currency { get; init; } = string.Empty;
}