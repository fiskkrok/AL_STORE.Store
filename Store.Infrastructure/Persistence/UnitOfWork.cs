using Store.Application.Contracts;

// Add this using directive

namespace Store.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork, IDisposable // Implement IDisposable
{
    private readonly StoreDbContext _context;
    private bool _disposed;

    public UnitOfWork(StoreDbContext context)
    {
        _context = context;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing) _context?.Dispose(); // Ensure _context is not null and call Dispose
        _disposed = true;
    }
}