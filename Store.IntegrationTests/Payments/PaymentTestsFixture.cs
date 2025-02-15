using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Store.Infrastructure.Persistence;
using Store.Infrastructure.Services.Models;
using Testcontainers.MsSql;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using WireMock.Server;

namespace Store.IntegrationTests.Payments;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly MsSqlContainer _dbContainer;
    private readonly WireMockServer _mockKlarnaApi;

    public CustomWebApplicationFactory()
    {
        _dbContainer = new MsSqlBuilder()
            .WithPassword("Your_password123")
            .Build();

        _mockKlarnaApi = WireMockServer.Start();
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        _dbContainer.StartAsync().Wait();

        builder.ConfigureServices(services =>
        {
            // Remove existing DbContext configuration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<StoreDbContext>));

            if (descriptor != null) services.Remove(descriptor);

            // Add DB context pointing to test container
            services.AddDbContext<StoreDbContext>(options =>
            {
                options.UseSqlServer(_dbContainer.GetConnectionString());
            });

            // Configure mock Klarna API
            services.Configure<KlarnaOptions>(options =>
            {
                options.ApiUrl = _mockKlarnaApi.Url;
                options.Username = "test";
                options.Password = "test";
            });
        });

        return base.CreateHost(builder);
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            _dbContainer.DisposeAsync().AsTask().Wait();
            _mockKlarnaApi.Dispose();
        }
    }
}

public class PaymentTestsFixture : IAsyncLifetime
{
    public PaymentTestsFixture()
    {
        Factory = new CustomWebApplicationFactory();
        MockKlarnaApi = WireMockServer.Start();
        Client = Factory.CreateClient();
    }

    public HttpClient Client { get; private set; }
    public CustomWebApplicationFactory Factory { get; }
    public WireMockServer MockKlarnaApi { get; }

    public async Task InitializeAsync()
    {
        // Setup mock responses
        MockKlarnaApi
            .Given(Request.Create()
                .WithPath("/payments/v1/sessions")
                .UsingPost())
            .RespondWith(Response.Create()
                .WithStatusCode(200)
                .WithHeader("Content-Type", "application/json")
                .WithBody(@"{
                    ""client_token"": ""test-token"",
                    ""session_id"": ""test-session"",
                    ""payment_methods"": [
                        {
                            ""id"": ""klarna"",
                            ""name"": ""Pay with Klarna"",
                            ""allowed"": true
                        }
                    ]
                }"));

        MockKlarnaApi.Reset();
    }

    public async Task DisposeAsync()
    {
        MockKlarnaApi.Dispose();
        await Factory.DisposeAsync();
    }
}

public static class HttpClientExtensions
{
    public static async Task<HttpResponseMessage> PostAsJsonAsync<T>(
        this HttpClient client,
        string url,
        T data,
        Dictionary<string, string>? headers = null)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(data)
        };

        if (headers != null)
            foreach (var (key, value) in headers)
                request.Headers.Add(key, value);

        return await client.SendAsync(request);
    }
}