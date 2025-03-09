using MediatR;

namespace Store.Infrastructure.Services.Events;

public class DomainEventNotification<T> : INotification
{
    public T DomainEvent { get; set; }

    public DomainEventNotification(T domainEvent)
    {
        DomainEvent = domainEvent ?? throw new ArgumentNullException(nameof(domainEvent));
    }
}
