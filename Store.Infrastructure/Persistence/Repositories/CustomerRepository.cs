using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;
using Store.Application.Contracts;
using Store.Domain.Entities.Customer;

namespace Store.Infrastructure.Persistence.Repositories;
public class CustomerRepository : Repository<CustomerProfile>, ICustomerRepository
{
    private readonly StoreDbContext _context;

    public CustomerRepository(StoreDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<CustomerProfile?> GetByUserIdAsync(
        string userId,
        CancellationToken ct = default)
    {
        return await _context.Set<CustomerProfile>()
            .Include(c => c.Addresses)
            .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted, ct);
    }

    public async Task<CustomerProfile?> GetByEmailAsync(
        string email,
        CancellationToken ct = default)
    {
        return await _context.Set<CustomerProfile>()
            .FirstOrDefaultAsync(c => c.Email.Value == email && !c.IsDeleted, ct);
    }

    public async Task<bool> ExistsAsync(
        string userId,
        CancellationToken ct = default)
    {
        return await _context.Set<CustomerProfile>()
            .AnyAsync(c => c.UserId == userId && !c.IsDeleted, ct);
    }

    public async Task<IReadOnlyList<CustomerAddress>> GetAddressesAsync(
        Guid customerId,
        CancellationToken ct = default)
    {
        return await _context.Set<CustomerAddress>()
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.IsDefault)
            .ThenBy(a => a.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task AddAddressAsync(
        CustomerAddress address,
        CancellationToken ct = default)
    {
        await _context.Set<CustomerAddress>().AddAsync(address, ct);
    }
}