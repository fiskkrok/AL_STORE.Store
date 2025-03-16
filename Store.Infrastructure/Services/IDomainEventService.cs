using MediatR;
using Store.Domain.Common;

namespace Store.Infrastructure.Services;

public interface IDomainEventService
{
    Task PublishAsync(BaseDomainEvent domainEvent, CancellationToken cancellationToken);
    INotification GetNotificationCorrespondingToDomainEvent(BaseDomainEvent domainEvent);
}