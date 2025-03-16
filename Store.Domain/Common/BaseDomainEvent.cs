using MediatR;

namespace Store.Domain.Common;

public abstract class BaseDomainEvent : INotification, IMessage
{
    protected BaseDomainEvent()
    {
        EventId = Guid.NewGuid();
        OccurredOn = DateTime.UtcNow;
    }

    public Guid EventId { get; }
    public DateTime OccurredOn { get; }
}

public interface IMessage
{
    Guid EventId { get; }
    DateTime OccurredOn { get; }

}