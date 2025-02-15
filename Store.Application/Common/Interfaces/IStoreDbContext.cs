using Microsoft.EntityFrameworkCore;
using Store.Domain.Common;

namespace Store.Application.Common.Interfaces;

public interface IStoreDbContext
{
    DbSet<TEntity> Set<TEntity>() where TEntity : BaseEntity;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}