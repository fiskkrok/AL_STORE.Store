using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
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

        // Remove the token handler, just use API key
        services.AddHttpClient<IAdminApiClient, AdminApiClient>(client =>
            {
                client.BaseAddress = new Uri(configuration["AdminApi:BaseUrl"]!);
                // Add API key directly to default headers
                client.DefaultRequestHeaders.Add("X-API-Key", apiKey);
            }).AddPolicyHandler(GetRetryPolicy(services))
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
                (outcome, timeSpan, retryCount, context) =>
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

public class ApiKeyAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private const string ApiKeyHeaderName = "X-API-Key";
    private readonly IConfiguration _configuration;
    private readonly ILogger<ApiKeyAuthenticationHandler> _logger;

    public ApiKeyAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ISystemClock clock,
        IConfiguration configuration)
        : base(options, logger, encoder, clock)
    {
        _configuration = configuration;
        _logger = logger.CreateLogger<ApiKeyAuthenticationHandler>();
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        _logger.LogInformation("Handling API key authentication");

        if (!Request.Headers.TryGetValue(ApiKeyHeaderName, out var apiKeyHeaderValues))
        {
            _logger.LogWarning("API Key header is missing");
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var providedApiKey = apiKeyHeaderValues.ToString();
        var validApiKey = _configuration["AdminApi:ApiKey"];

        _logger.LogInformation("Provided API Key: {ProvidedKey}", providedApiKey);
        _logger.LogInformation("Configured API Key: {ConfiguredKey}", validApiKey);

        if (string.IsNullOrEmpty(validApiKey))
        {
            _logger.LogError("API Key is not configured");
            return Task.FromResult(AuthenticateResult.Fail("API Key is not configured"));
        }

        if (providedApiKey != validApiKey)
        {
            _logger.LogWarning("Invalid API Key provided");
            return Task.FromResult(AuthenticateResult.Fail("Invalid API Key"));
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "Store API"),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        _logger.LogInformation("API Key authentication successful");
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}