using Store.Application.Payments.Models;

namespace Store.Application.Orders.Models;

public class OrderConfirmationDto
{
    public string OrderNumber { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public AddressDto ShippingAddress { get; init; } = new();
    public List<OrderConfirmationItemDto> Items { get; init; } = new();
    public decimal Total { get; init; }
    public DateTime CreatedAt { get; init; }
    public string PaymentMethod { get; init; } = string.Empty;
}

public class OrderConfirmationItemDto
{
    public Guid ProductId { get; init; }
    public string Name { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal Price { get; init; }
}