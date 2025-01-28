

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Extensions.Http;
using Store.Infrastructure.Services;

namespace Store.Infrastructure.Configuration;
public static class ProductServicesDependencyInjection
{
    public static IServiceCollection AddProductServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var apiKey = configuration["AdminApi:ApiKey"]
                     ?? throw new InvalidOperationException("Admin API Key not configured");

        services.AddHttpClient<IAdminApiClient, AdminApiClient>(client =>
        {
            client.BaseAddress = new Uri(configuration["AdminApi:BaseUrl"]!);
        })
            .AddHttpMessageHandler(() => new ApiKeyAuthenticationHandler(apiKey))
            .AddPolicyHandler(GetRetryPolicy(services))
            .AddPolicyHandler(GetCircuitBreakerPolicy());

        services.AddScoped<ProductSyncService>();

        return services;
    }

    private static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy(IServiceCollection services)
    {
        var serviceProvider = services.BuildServiceProvider();
        var logger = serviceProvider.GetRequiredService<ILogger<ProductSyncService>>();

        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .Or<TimeoutException>()
            .WaitAndRetryAsync(3, retryAttempt =>
                    TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (outcome, timeSpan, retryCount, context) =>
                {
                    logger.LogWarning(outcome.Exception,
                        "Retry {RetryCount} after {Delay}s delay due to {Message}",
                        retryCount,
                        timeSpan.TotalSeconds,
                        outcome.Exception.Message);
                });
    }

    private static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
    {
        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30));
    }
}

public class ApiKeyAuthenticationHandler : DelegatingHandler
{
    private readonly string _apiKey;

    public ApiKeyAuthenticationHandler(string apiKey)
    {
        _apiKey = apiKey;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        request.Headers.Add("X-API-Key", _apiKey);
        return await base.SendAsync(request, cancellationToken);
    }
}