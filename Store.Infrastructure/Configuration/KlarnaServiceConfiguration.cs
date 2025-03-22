using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.CircuitBreaker;
using Polly.Extensions.Http;
using Polly.Retry;
using Store.Infrastructure.Services;
using Store.Infrastructure.Services.Models;

namespace Store.Infrastructure.Configuration;

public static class KlarnaServiceConfiguration
{
    public static IServiceCollection AddKlarnaService(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<KlarnaOptions>(
            configuration.GetSection("Klarna"));

        services.AddHttpClient<KlarnaService, KlarnaService>((sp, client) =>
            {
                var options = configuration.GetSection("Klarna").Get<KlarnaOptions>();
                if (options?.ApiUrl == null)
                    throw new InvalidOperationException("Klarna API URL not configured");

                client.BaseAddress = new Uri(options.ApiUrl);
                client.Timeout = TimeSpan.FromSeconds(30);
            })
            .AddPolicyHandler(GetRetryPolicy())
            .AddPolicyHandler(GetCircuitBreakerPolicy());

        return services;
    }

    private static AsyncRetryPolicy<HttpResponseMessage> GetRetryPolicy()
    {
        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .Or<TimeoutException>()
            .WaitAndRetryAsync(3, retryAttempt =>
                TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
    }

    private static AsyncCircuitBreakerPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
    {
        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30));
    }
}