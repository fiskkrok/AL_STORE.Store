using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

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

namespace Store.Infrastructure.Configuration;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {

        services.AddDbContext<StoreDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(StoreDbContext).Assembly.FullName)));

        services.AddScoped<IStoreDbContext>(provider => provider.GetService<StoreDbContext>()!);
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddSingleton<IDateTime, DateTimeService>();
        services.AddScoped<IDomainEventService, DomainEventService>();
        services.AddScoped<ICurrentUser, CurrentUserService>();
        services.AddScoped<ICategorySeeder, CategorySeeder>();
        services.AddScoped<IStoreSeeder, StoreSeeder>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IPaymentSessionRepository, PaymentSessionRepository>();
        services.AddScoped<IKlarnaService, KlarnaService>();
        services.AddScoped<IIdempotencyService, IdempotencyService>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        // Add email service
        services.AddEmailService(configuration);
        services.AddLogging(o => o.AddConsole());
        // Redis Configuration
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis");
            options.InstanceName = "StoreCache:";
        });
        services.AddSingleton<IConnectionMultiplexer>(provider =>
        {
            var redisConnectionString = configuration.GetConnectionString("Redis")!;
            int retryCount = 3;
            int delay = 2000; // 2 seconds
            for (int i = 0; i < retryCount; i++)
            {
                try
                {
                    return ConnectionMultiplexer.Connect(redisConnectionString);
                }
                catch (RedisConnectionException ex)
                {
                    Console.WriteLine(ex.ToString(), "Failed to connect to Redis. Attempt {Attempt} of {RetryCount}", i + 1, retryCount);
                    if (i == retryCount - 1)
                    {
                        throw;
                    }
                    Thread.Sleep(delay);
                }
            }
            throw new RedisConnectionException(ConnectionFailureType.UnableToConnect, "Failed to connect to Redis after multiple attempts.");
    });
        services.AddScoped<ICacheService, RedisCacheService>();

        // HTTP Context and Auth
        services.AddHttpContextAccessor();

        return services;
    }


    public static IServiceCollection AddRealTimeServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSignalR();
        return services;
    }

    public static WebApplication UseRealTimeServices(this WebApplication app)
    {
        app.UseEndpoints(endpoints => { endpoints.MapHub<ProductHub>("/hubs/product"); });


        return app;
    }

    public static IServiceCollection AddBackgroundJobs(this IServiceCollection services)
    {
        services.AddHostedService<CacheInvalidationJob>();

        return services;
    }
}