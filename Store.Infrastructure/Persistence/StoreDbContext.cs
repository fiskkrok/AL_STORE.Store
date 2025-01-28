using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Store.Application.Common.Interfaces;
using Store.Domain.Common;
using MediatR;
using Store.Domain.Entities.Product;

namespace Store.Infrastructure.Persistence;
public class StoreDbContext : DbContext, IStoreDbContext
{
    private readonly ICurrentUser _currentUser;
    private readonly IDateTime _dateTime;
    private readonly IMediator _mediator;

    public StoreDbContext(
        DbContextOptions<StoreDbContext> options,
        ICurrentUser currentUser,
        IDateTime dateTime,
        IMediator mediator) : base(options)
    {
        _currentUser = currentUser;
        _dateTime = dateTime;
        _mediator = mediator;
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<ProductSyncHistory> SyncHistory => Set<ProductSyncHistory>();



    DbSet<TEntity> IStoreDbContext.Set<TEntity>()
    {
        return base.Set<TEntity>();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseAuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedBy = _currentUser.Id;
                    entry.Entity.Created = _dateTime.UtcNow;
                    break;

                case EntityState.Modified:
                    entry.Entity.LastModifiedBy = _currentUser.Id;
                    entry.Entity.LastModified = _dateTime.UtcNow;
                    break;
            }
        }

        var events = ChangeTracker.Entries<BaseEntity>()
            .Select(x => x.Entity)
            .Where(x => x.DomainEvents.Any())
            .SelectMany(x => x.DomainEvents)
            .ToList();

        var result = await base.SaveChangesAsync(cancellationToken);

        // Dispatch domain events after save
        foreach (var @event in events)
        {
            await _mediator.Publish(@event, cancellationToken);
        }

        return result;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        modelBuilder.Ignore<BaseDomainEvent>();
        base.OnModelCreating(modelBuilder);
    }
}

