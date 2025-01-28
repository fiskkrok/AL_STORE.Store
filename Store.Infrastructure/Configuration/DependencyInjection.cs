using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using StackExchange.Redis;

using Store.Application.Common.Interfaces;
using Store.Infrastructure.BackgroundJobs;
using Store.Infrastructure.Caching;
using Store.Infrastructure.Identity;
using Store.Infrastructure.Persistence;
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

        // Redis Configuration
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis");
            options.InstanceName = "StoreCache:";
        });
        services.AddSingleton<IConnectionMultiplexer>(provider =>
            ConnectionMultiplexer.Connect(configuration.GetConnectionString("Redis")!));
        services.AddScoped<ICacheService, RedisCacheService>();

        // HTTP Context and Auth
        services.AddHttpContextAccessor();

        return services;
    }

    public static IServiceCollection AddAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.Authority = configuration["Auth0:Authority"];
            options.Audience = configuration["Auth0:Audience"];
        });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("RequireCustomerRole", policy =>
                policy.RequireClaim("scope", "customer"));
        });

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
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapHub<ProductHub>("/hubs/product");
        });


        return app;
    }

    public static IServiceCollection AddBackgroundJobs(this IServiceCollection services)
    {
        services.AddHostedService<CacheInvalidationJob>();

        return services;
    }
}
