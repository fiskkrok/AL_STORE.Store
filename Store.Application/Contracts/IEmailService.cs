using Store.Domain.Common;
using Store.Domain.Entities.Order;

namespace Store.Application.Contracts;

public interface IEmailService
{
    Task<Result<bool>> SendOrderConfirmationAsync(Order order, CancellationToken ct = default);
    Task<Result<bool>> SendOrderShippedAsync(Order order, string trackingNumber, CancellationToken ct = default);
}