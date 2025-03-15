using Store.Application.Common.Models;

namespace Store.Application.Orders.Models;

public class OrderSummaryDto : BaseDto
{
    public string OrderNumber { get; init; } = string.Empty;
    public List<OrderLineItemDto> OrderLineItems { get; set; } = [];
    public DateTime Created { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public int ItemCount { get; init; }
}