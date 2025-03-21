// Store.API/Configuration/ApiServicesConfiguration.cs
using FastEndpoints;

using FluentValidation;

using Microsoft.Extensions.Caching.StackExchangeRedis;

using Store.API.Middleware;
using Store.API.Validation;
using Store.Infrastructure.Configuration;

using ZiggyCreatures.Caching.Fusion;
using ZiggyCreatures.Caching.Fusion.Serialization.SystemTextJson;

namespace Store.API.Configuration;
/// <summary>
/// Configures and adds various API services to the service collection, including middleware, HTTP clients, and caching
/// options. Also sets up authentication, CORS, response compression, and real-time infrastructure.
/// </summary>
public static class ApiServicesConfiguration
{
    /// <summary>
    /// 
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    /// <returns></returns>
    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add API-specific services
        services.AddScoped<GlobalExceptionHandlingMiddleware>();

        // Configure base HTTP clients
        var frontendBaseUrl = configuration.GetSection("Frontend:BaseUrl").Value;
        services.AddHttpClient("FrontendClient", client => {
            client.BaseAddress = new Uri(frontendBaseUrl!);
        });

        // Add controllers, FastEndpoints, and other API components
        services.AddFastEndpoints(options => {
            options.IncludeAbstractValidators = true;
        });

        // Add validators
        services.AddValidatorsFromAssemblyContaining<CreateProfileValidator>();

        // Add specific configurations
        services.AddAuth(configuration);           // Auth
        services.AddCorsConfig();                  // CORS
        services.AddResponseCompression();         // Response compression
        services.AddRealTimeInfrastructure(configuration); // SignalR

        // Add hybrid cache
        services.AddFusionCache()
            .WithDefaultEntryOptions(options => options.Duration = TimeSpan.FromMinutes(5))
            .WithSerializer(new FusionCacheSystemTextJsonSerializer())
            .WithDistributedCache(
                new RedisCache(new RedisCacheOptions
                {
                    Configuration = configuration.GetConnectionString("Redis")
                }))
            .AsHybridCache();

        return services;
    }
}