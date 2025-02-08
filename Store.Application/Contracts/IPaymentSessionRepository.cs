using Store.Domain.Entities.Order;

namespace Store.Application.Contracts;

public interface IPaymentSessionRepository
{
    Task<PaymentSession?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PaymentSession?> GetActiveSessionForOrderAsync(Guid orderId, CancellationToken ct = default);
    Task<IReadOnlyList<PaymentSession>> GetSessionsForOrderAsync(Guid orderId, CancellationToken ct = default);
    Task AddAsync(PaymentSession session, CancellationToken ct = default);
    void Update(PaymentSession session);
}