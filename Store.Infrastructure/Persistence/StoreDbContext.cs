﻿using System.Reflection;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Store.Application.Common.Interfaces;
using Store.Domain.Common;
using Store.Domain.Entities.Customer;
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
    public DbSet<CustomerProfile> CustomerProfile => Set<CustomerProfile>();
    public DbSet<ProductSyncHistory> SyncHistory => Set<ProductSyncHistory>();


    DbSet<TEntity> IStoreDbContext.Set<TEntity>()
    {
        return base.Set<TEntity>();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseAuditableEntity>())
            // TODO: Ändra till riktig användare guid här sen
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedBy = _currentUser.Id ?? Guid.NewGuid().ToString();
                    entry.Entity.Created = _dateTime.UtcNow;
                    break;

                case EntityState.Modified:
                    entry.Entity.LastModifiedBy = _currentUser.Id ?? Guid.NewGuid().ToString();
                    entry.Entity.LastModified = _dateTime.UtcNow;
                    break;
            }

        var events = ChangeTracker.Entries<BaseEntity>()
            .Select(x => x.Entity)
            .Where(x => x.DomainEvents.Any())
            .SelectMany(x => x.DomainEvents)
            .ToList();

        var result = await base.SaveChangesAsync(cancellationToken);

        // Dispatch domain events after save
        foreach (var @event in events) await _mediator.Publish(@event, cancellationToken);

        return result;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        modelBuilder.Ignore<BaseDomainEvent>();
        base.OnModelCreating(modelBuilder);
    }
}