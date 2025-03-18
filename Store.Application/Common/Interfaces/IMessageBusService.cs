namespace Store.Application.Common.Interfaces;
public interface IEventBus
{
    Task PublishAsync<T>(T @event, CancellationToken cancellationToken = default) where T : class;
}
