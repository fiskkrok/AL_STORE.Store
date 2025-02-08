namespace Store.Domain.Entities.Order;

public enum OrderStatus
{
    Pending,
    Processing,
    Completed,
    Failed,
    Cancelled
}