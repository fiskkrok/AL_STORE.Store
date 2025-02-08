using MediatR;
using Store.Domain.Common;

namespace Store.Infrastructure.Services;

public interface IDomainEventService
{
    Task PublishAsync(BaseDomainEvent domainEvent);
    INotification GetNotificationCorrespondingToDomainEvent(BaseDomainEvent domainEvent);
}