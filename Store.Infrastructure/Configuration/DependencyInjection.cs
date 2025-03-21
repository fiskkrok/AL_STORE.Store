// Store.Infrastructure/Configuration/DependencyInjection.cs
using MediatR;

using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using StackExchange.Redis;

using Store.Application.Common.Interfaces;
using Store.Application.Contracts;
using Store.Infrastructure.BackgroundJobs;
using Store.Infrastructure.Caching;
using Store.Infrastructure.Identity;
using Store.Infrastructure.Persistence;
using Store.Infrastructure.Persistence.Repositories;
using Store.Infrastructure.Persistence.Seeding;
using Store.Infrastructure.RealTime;
using Store.Infrastructure.Services;
using Store.Infrastructure.Services.Events;

namespace Store.Infrastructure.Configuration;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database setup
        services.AddDbContext<StoreDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(StoreDbContext).Assembly.FullName)));

        // Register repositories and core services
        services.AddScoped<IStoreDbContext>(provider => provider.GetService<StoreDbContext>()!);
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IDomainEventService, DomainEventService>();
        services.AddSingleton<IDateTime, DateTimeService>();

        // Register repositories
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IPaymentSessionRepository, PaymentSessionRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();

        // Register business services
        services.AddScoped<IKlarnaService, KlarnaService>();
        services.AddScoped<IIdempotencyService, IdempotencyService>();

        services.AddScoped<ICurrentUser, CurrentUserService>();
        services.AddScoped<ICategorySeeder, CategorySeeder>();
        services.AddScoped<IStoreSeeder, StoreSeeder>();

        // Add MediatR behavior for domain event publishing
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(DomainEventPublishingBehavior<,>));

        // Add feature-specific configurations
        services.AddMessagingInfrastructure(configuration);  // MassTransit & RabbitMQ
        services.AddEmailService(configuration);            // Email service
        services.AddRealTimeInfrastructure(configuration);  // SignalR backend
        services.AddProductServices(configuration);         // Product sync
        services.AddCacheInfrastructure(configuration);     // Redis caching
        services.AddBackgroundJobs();                       // Background services

        // Add HTTP context accessor
        services.AddHttpContextAccessor();

        return services;
    }

    // Private helper methods for specialized configurations
    private static IServiceCollection AddCacheInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Redis connection setup
        services.AddSingleton<IConnectionMultiplexer>(provider =>
        {
            var redisConnectionString = configuration.GetConnectionString("Redis")!;
            var retryCount = 3;
            var delay = 2000; // 2 seconds

            for (var i = 0; i < retryCount; i++)
            {
                try
                {
                    return ConnectionMultiplexer.Connect(redisConnectionString);
                }
                catch (RedisConnectionException ex)
                {
                    if (i == retryCount - 1) throw;
                    Thread.Sleep(delay);
                }
            }

            throw new RedisConnectionException(ConnectionFailureType.UnableToConnect,
                "Failed to connect to Redis after multiple attempts.");
        });

        services.AddScoped<ICacheService, RedisCacheService>();

        return services;
    }

    public static IServiceCollection AddBackgroundJobs(this IServiceCollection services)
    {
        services.AddHostedService<CacheInvalidationJob>();
        return services;
    }

    public static IServiceCollection AddRealTimeInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSignalR();
        // SignalR infrastructure-specific setup
        services.AddScoped<IProductUpdateService, ProductUpdateService>();

        return services;
    }
    public static WebApplication UseRealTimeServices(this WebApplication app)
    {
        app.UseEndpoints(endpoints => { endpoints.MapHub<ProductHub>("/hubs/product"); });


        return app;
    }
}