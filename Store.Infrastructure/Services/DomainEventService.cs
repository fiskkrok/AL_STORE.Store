using MediatR;

using Microsoft.Extensions.Logging;

using Store.Application.Common.Interfaces;
using Store.Domain.Common;
using Store.Domain.Entities.Order;
using Store.Infrastructure.Services.Events;
using OrderCreatedEvent = Store.Contracts.Events.OrderCreatedEvent;

namespace Store.Infrastructure.Services;

public class DomainEventService : IDomainEventService
{
    private readonly ILogger<DomainEventService> _logger;
    private readonly IPublisher _mediator;
    private readonly IEventBus _eventBus;

    public DomainEventService(
        ILogger<DomainEventService> logger,
        IPublisher mediator,
        IEventBus eventBus)
    {
        _logger = logger;
        _mediator = mediator;
        _eventBus = eventBus;
    }

    public async Task PublishAsync(BaseDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Publishing domain event. Event - {event}", domainEvent.GetType().Name);

        // First, publish using MediatR for in-process handlers
        await _mediator.Publish(GetNotificationCorrespondingToDomainEvent(domainEvent), cancellationToken);

        // Then, map and publish to MassTransit if it's an event we want to distribute
        await PublishToEventBusIfNeeded(domainEvent);
    }

    private async Task PublishToEventBusIfNeeded(BaseDomainEvent domainEvent)
    {
        switch (domainEvent)
        {
            case Store.Domain.Entities.Order.OrderCreatedEvent orderCreated:
                await _eventBus.PublishAsync(new OrderCreatedEvent(
                    orderCreated.Order.Id,
                    orderCreated.Order.OrderNumber,
                    orderCreated.Order.CustomerId,
                    orderCreated.Order.TotalAmount.Amount,
                    orderCreated.Order.TotalAmount.Currency,
                    DateTime.UtcNow));
                break;

            case Store.Domain.Entities.Order.OrderCompletedEvent orderCompleted:
                await _eventBus.PublishAsync(new Store.Contracts.Events.OrderStatusChangedEvent(
                    orderCompleted.Order.Id,
                    orderCompleted.Order.OrderNumber,
                    "Processing", // Previous status 
                    "Completed",  // Current status
                    DateTime.UtcNow));
                break;

            // Map other relevant domain events
        }
    }


    public INotification GetNotificationCorrespondingToDomainEvent(BaseDomainEvent domainEvent)
    {
        return (INotification)Activator.CreateInstance(
            typeof(DomainEventNotification<>).MakeGenericType(domainEvent.GetType()), domainEvent)!;
    }
}