using System.Threading;

using MediatR;

using Microsoft.Extensions.Logging;

using Store.Application.Common.Interfaces;
using Store.Domain.Common;
using Store.Infrastructure.Services.Events;

namespace Store.Infrastructure.Services;

public class DomainEventService : IDomainEventService
{
    private readonly ILogger<DomainEventService> _logger;
    private readonly IPublisher _mediator;
    private readonly IMessageBusService _messageBus;

    public DomainEventService(ILogger<DomainEventService> logger, IPublisher mediator, IMessageBusService messageBus)
    {
        _logger = logger;
        _mediator = mediator;
        _messageBus = messageBus;
    }

    public async Task PublishAsync(BaseDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Publishing domain event. Event - {event}", domainEvent.GetType().Name);
        await _mediator.Publish(GetNotificationCorrespondingToDomainEvent(domainEvent), cancellationToken);
       
            await _messageBus.PublishAsync(domainEvent, cancellationToken);
        
    }

    public INotification GetNotificationCorrespondingToDomainEvent(BaseDomainEvent domainEvent)
    {
        return (INotification)Activator.CreateInstance(
            typeof(DomainEventNotification<>).MakeGenericType(domainEvent.GetType()), domainEvent)!;
    }
}