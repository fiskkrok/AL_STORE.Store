// Store.Infrastructure/Services/Events/DomainEventNotification.cs
using MediatR;

namespace Store.Infrastructure.Services.Events;

public class DomainEventNotification<T> : INotification
{
    public DomainEventNotification(T domainEvent)
    {
        DomainEvent = domainEvent ?? throw new ArgumentNullException(nameof(domainEvent));
    }

    public T DomainEvent { get; set; }
}