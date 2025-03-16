using Microsoft.EntityFrameworkCore;
using Store.Application.Contracts;
using Store.Domain.Entities.Order;

namespace Store.Infrastructure.Persistence.Repositories;

internal class OrderRepository : Repository<Order>, IOrderRepository
{
    private readonly StoreDbContext _context;

    public OrderRepository(StoreDbContext context) : base(context)
    {
        _context = context;
    }

    public override async Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Set<Order>()
            .Include(o => o.OrderLines)
            .FirstOrDefaultAsync(o => o.Id == id, ct);
    }
    public async Task<Order?> GetByKlarnaAsync(string id, CancellationToken ct = default)
    {
        return await _context.Set<Order>()
            .Include(o => o.OrderLines)
            .FirstOrDefaultAsync(o => o.KlarnaOrderReference == id, ct);
    }

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default)
    {
        return await _context.Set<Order>()
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);
    }

    public async Task<Order?> GetWithPaymentSessionsAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Set<Order>()
            .Include(o => o.OrderLines)
            .Include(o => o.PaymentAttempts)
            .FirstOrDefaultAsync(o => o.Id == id, ct);
    }

    public async Task<IReadOnlyList<Order>> GetCustomerOrdersAsync(string customerId, CancellationToken ct = default)
    {
        return await _context.Set<Order>()
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.Created).Include(o => o.OrderLines)
            .ToListAsync(ct);
    }

    public async Task<string> GenerateOrderNumberAsync(CancellationToken ct = default)
    {
        // Get the current date in format YYYYMMDD
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");

        // Get the last order number for today
        var lastOrder = await _context.Set<Order>()
            .Where(o => o.OrderNumber.StartsWith(datePart))
            .OrderByDescending(o => o.OrderNumber)
            .FirstOrDefaultAsync(ct);

        var sequence = 1;
        if (lastOrder != null)
        {
            // Extract the sequence number from the last order
            var lastSequence = int.Parse(lastOrder.OrderNumber.Substring(8));
            sequence = lastSequence + 1;
        }

        // Combine date and sequence (padded to 4 digits)
        return $"{datePart}{sequence:D4}";
    }
}