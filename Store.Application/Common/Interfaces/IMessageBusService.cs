using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Application.Common.Interfaces;
public interface IMessageBusService
{
    Task PublishAsync<T>(T message, CancellationToken cancellationToken = default) where T : Domain.Common.IMessage;
}
