namespace Store.Contracts.Events;

public record OrderCreatedEvent(
    Guid OrderId,
    string OrderNumber,
    string CustomerId,
    string CustomerName,
    string CustomerEmail,
    decimal TotalAmount,
    string Currency,
    DateTime CreatedAt);

public record OrderStatusChangedEvent(
    Guid OrderId,
    string OrderNumber,
    string PreviousStatus,
    string CurrentStatus,
    DateTime ChangedAt);

public record PaymentProcessedEvent(
    Guid OrderId,
    Guid PaymentId,
    decimal Amount,
    string Currency,
    bool Successful,
    DateTime ProcessedAt);
