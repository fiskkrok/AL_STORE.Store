using Microsoft.EntityFrameworkCore;
using Store.Application.Contracts;
using Store.Domain.Entities.Order;
using Store.Domain.Enums;

namespace Store.Infrastructure.Persistence.Repositories;

public class PaymentSessionRepository : Repository<PaymentSession>, IPaymentSessionRepository
{
    private readonly StoreDbContext _context;

    public PaymentSessionRepository(StoreDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<PaymentSession?> GetActiveSessionForOrderAsync(Guid orderId, CancellationToken ct = default)
    {
        return await _context.Set<PaymentSession>()
            .Where(ps => ps.OrderId == orderId &&
                         ps.Status != PaymentSessionStatus.Completed &&
                         ps.Status != PaymentSessionStatus.Failed &&
                         ps.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(ps => ps.CreatedAt)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<PaymentSession>> GetSessionsForOrderAsync(Guid orderId,
        CancellationToken ct = default)
    {
        return await _context.Set<PaymentSession>()
            .Where(ps => ps.OrderId == orderId)
            .OrderByDescending(ps => ps.CreatedAt)
            .ToListAsync(ct);
    }
}