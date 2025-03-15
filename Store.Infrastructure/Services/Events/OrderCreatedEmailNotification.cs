using MediatR;
using Microsoft.Extensions.Logging;
using Store.Application.Contracts;
using Store.Domain.Entities.Order;

namespace Store.Infrastructure.Services.Events;

public class OrderCreatedEmailNotification : INotificationHandler<DomainEventNotification<OrderCreatedEvent>>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<OrderCreatedEmailNotification> _logger;

    public OrderCreatedEmailNotification(
        IEmailService emailService,
        ILogger<OrderCreatedEmailNotification> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task Handle(DomainEventNotification<OrderCreatedEvent> notification,
        CancellationToken cancellationToken)
    {
        var orderEvent = notification.DomainEvent;
        _logger.LogInformation("Handling order created event for order {OrderId}", orderEvent.Order.Id);

        var result = await _emailService.SendOrderConfirmationAsync(orderEvent.Order, cancellationToken);

        if (!result.IsSuccess)
            _logger.LogWarning("Failed to send order confirmation email for order {OrderId}: {ErrorMessage}",
                orderEvent.Order.Id, string.Join(", ", result.Errors.Select(e => e.Message)));
    }
}

public class OrderCompletedEmailNotification : INotificationHandler<DomainEventNotification<OrderCompletedEvent>>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<OrderCompletedEmailNotification> _logger;

    public OrderCompletedEmailNotification(
        IEmailService emailService,
        ILogger<OrderCompletedEmailNotification> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task Handle(DomainEventNotification<OrderCompletedEvent> notification,
        CancellationToken cancellationToken)
    {
        var orderEvent = notification.DomainEvent;
        _logger.LogInformation("Handling order completed event for order {OrderId}", orderEvent.Order.Id);

        // You might want to get the tracking number from somewhere in a real application
        var trackingNumber = $"TRK{DateTime.Now.ToString("yyyyMMddHHmm")}{new Random().Next(1000, 9999)}";

        var result = await _emailService.SendOrderShippedAsync(orderEvent.Order, trackingNumber, cancellationToken);

        if (!result.IsSuccess)
            _logger.LogWarning("Failed to send order shipped email for order {OrderId}: {ErrorMessage}",
                orderEvent.Order.Id, string.Join(", ", result.Errors.Select(e => e.Message)));
    }
}