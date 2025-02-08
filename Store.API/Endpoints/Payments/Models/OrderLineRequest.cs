namespace Store.API.Endpoints.Payments.Models;

public class OrderLineRequest
{
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? Sku { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
}