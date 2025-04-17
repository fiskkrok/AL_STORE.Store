// Store.Infrastructure/Configuration/DependencyInjection.cs
using MediatR;

using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
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
    public static void AddInfrastructure(
        this WebApplicationBuilder builder,
        IConfiguration configuration)
    {
        // Database setup
        builder.AddSqlServerDbContext<StoreDbContext>("StoreConnection", null,
            sqlOptions =>
            {
                var options = new SqlServerDbContextOptionsBuilder(sqlOptions);
                options.MigrationsAssembly(typeof(StoreDbContext).Assembly.FullName);
            });
        //builder.Services.AddDbContext<StoreDbContext>(options =>
        //    options.UseSqlServer(
        //        configuration.GetConnectionString("DefaultConnection"),
        //        b => b.MigrationsAssembly(typeof(StoreDbContext).Assembly.FullName)));

        // Register repositories and core services
        builder.Services.AddScoped<IStoreDbContext>(provider => provider.GetService<StoreDbContext>()!);
        builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
        builder.Services.AddScoped<IDomainEventService, DomainEventService>();
        builder.Services.AddSingleton<IDateTime, DateTimeService>();

        // Register repositories
        builder.Services.AddScoped<IOrderRepository, OrderRepository>();
        builder.Services.AddScoped<IPaymentSessionRepository, PaymentSessionRepository>();
        builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();

        // Register business services
        builder.Services.AddScoped<IKlarnaService, KlarnaService>();
        builder.Services.AddScoped<IIdempotencyService, IdempotencyService>();

        builder.Services.AddScoped<ICurrentUser, CurrentUserService>();
        builder.Services.AddScoped<ICategorySeeder, CategorySeeder>();
        builder.Services.AddScoped<IStoreSeeder, StoreSeeder>();

        // Add MediatR behavior for domain event publishing
        builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(DomainEventPublishingBehavior<,>));

        // Add feature-specific configurations
        builder.Services.AddMessagingInfrastructure(configuration);  // MassTransit & RabbitMQ
        builder.Services.AddEmailService(configuration);            // Email service
        builder.Services.AddRealTimeInfrastructure(configuration);  // SignalR backend
        builder.Services.AddProductServices(configuration);         // Product sync
        builder.Services.AddCacheInfrastructure(configuration);     // Redis caching
        builder.Services.AddBackgroundJobs();                       // Background services
        builder.Services.AddKlarnaService(configuration);
        // Add HTTP context accessor
        builder.Services.AddHttpContextAccessor();

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