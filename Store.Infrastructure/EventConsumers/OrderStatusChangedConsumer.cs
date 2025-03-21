using MassTransit;

using Microsoft.Extensions.Logging;

using Store.Contracts.Events;

public class OrderStatusChangedConsumer : IConsumer<OrderStatusChangedEvent>
{
    private readonly ILogger<OrderStatusChangedConsumer> _logger;

    public OrderStatusChangedConsumer(ILogger<OrderStatusChangedConsumer> logger)
    {
        _logger = logger;
    }

    public Task Consume(ConsumeContext<OrderStatusChangedEvent> context)
    {
        var message = context.Message;
        _logger.LogInformation(
            "Order {OrderId} status changed from {OldStatus} to {NewStatus}",
            message.OrderId, message.PreviousStatus, message.CurrentStatus);

        // Handle status change

        return Task.CompletedTask;
    }
}