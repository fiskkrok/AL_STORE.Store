using MediatR;
using Microsoft.Extensions.Logging;
using Store.Application.Common.Interfaces;
using Store.Domain.Common; // Add this using directive

namespace Store.Infrastructure.Services
{
    public interface IDomainEventService
    {
        Task PublishAsync(BaseDomainEvent domainEvent);
        INotification GetNotificationCorrespondingToDomainEvent(BaseDomainEvent domainEvent);
    }

    public class DomainEventService : IDomainEventService
    {
        private readonly ILogger<DomainEventService> _logger;
        private readonly IPublisher _mediator;

        public DomainEventService(ILogger<DomainEventService> logger, IPublisher mediator)
        {
            _logger = logger;
            _mediator = mediator;
        }

        public async Task PublishAsync(BaseDomainEvent domainEvent)
        {
            _logger.LogInformation("Publishing domain event. Event - {event}", domainEvent.GetType().Name);
            await _mediator.Publish(GetNotificationCorrespondingToDomainEvent(domainEvent));
        }

        public INotification GetNotificationCorrespondingToDomainEvent(BaseDomainEvent domainEvent)
        {
            return (INotification)Activator.CreateInstance(
                typeof(DomainEventNotification<>).MakeGenericType(domainEvent.GetType()), domainEvent)!;
        }
    }
}