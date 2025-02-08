using Store.Domain.Common;
using Store.Domain.ValueObjects;

namespace Store.Domain.Entities.Order;

public class OrderLine : BaseEntity
{
    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; }
    public string? Sku { get; private set; }
    public int Quantity { get; private set; }
    public Money UnitPrice { get; private set; }
    public Money LineTotal { get; private set; }

    private OrderLine() { } // For EF Core

    public OrderLine(
        Guid orderId,
        Guid productId,
        string productName,
        string? sku,
        int quantity,
        Money unitPrice)
    {
        OrderId = orderId;
        ProductId = productId;
        ProductName = productName;
        Sku = sku;
        Quantity = quantity;
        UnitPrice = unitPrice;
        LineTotal = Money.FromDecimal(unitPrice.Amount * quantity, unitPrice.Currency);
    }
}