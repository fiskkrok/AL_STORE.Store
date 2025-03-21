// Store.Infrastructure/Services/Events/DomainEventPublishingBehavior.cs
using MediatR;

using Microsoft.Extensions.Logging;

using Store.Application.Common.Interfaces;
using Store.Domain.Common;

using static MassTransit.ValidationResultExtensions;

namespace Store.Infrastructure.Services.Events;

public class DomainEventPublishingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEventBus _eventBus;
    private readonly IDomainEventService _domainEventService;
    private readonly ILogger<DomainEventPublishingBehavior<TRequest, TResponse>> _logger;

    public DomainEventPublishingBehavior(
        IEventBus eventBus,
        IDomainEventService domainEventService,
        ILogger<DomainEventPublishingBehavior<TRequest, TResponse>> logger)
    {
        _eventBus = eventBus;
        _domainEventService = domainEventService;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Process the request first
        var response = await next();

        // If response is a Result with domain events, map and publish them
        if (response is Result<TResponse> result && result.Value is IHasDomainEvents entity && entity.DomainEvents.Any())
        {
            _logger.LogInformation("Found {EventCount} domain events to publish",
                entity.DomainEvents.Count);

            foreach (var domainEvent in entity.DomainEvents)
            {
                await _domainEventService.PublishAsync(domainEvent, cancellationToken);
            }

            // Clear events after publishing
            entity.ClearDomainEvents();
        }

        return response;
    }
}

public interface IHasDomainEvents
{
    List<BaseDomainEvent> DomainEvents { get; }
    void ClearDomainEvents();
}