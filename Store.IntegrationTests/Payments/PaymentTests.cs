using System.Net;
using System.Net.Http.Json;

using Microsoft.AspNetCore.Mvc;

using Store.API.Endpoints.Payments.Models;

using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;

namespace Store.IntegrationTests.Payments;

public class PaymentTests : IClassFixture<PaymentTestsFixture>
{
    private readonly PaymentTestsFixture _fixture;
    private readonly HttpClient _client;

    public PaymentTests(PaymentTestsFixture fixture)
    {
        _fixture = fixture;
        _client = fixture.Client;
    }

    [Fact]
    public async Task CreatePaymentSession_WithValidRequest_ReturnsSuccessResponse()
    {

        // Arrange
        var request = PaymentTestData.CreateValidSessionRequest();
        var headers = new Dictionary<string, string>
        {
            { "Idempotency-Key", Guid.NewGuid().ToString() }
        };

        // Configure WireMock to return 200
        _fixture.MockKlarnaApi
            .Given(Request.Create().WithPath("/payments/v1/sessions").UsingPost())
            .RespondWith(Response.Create()
                .WithStatusCode(200)
                .WithHeader("Content-Type", "application/json")
                .WithBody(@"{
                ""client_token"": ""test-token"",
                ""session_id"": ""test-session"",
                ""payment_methods"": []
            }"));
        // Act
        var response = await _client.PostAsJsonAsync("/api/checkout/sessions", request, headers);

        // Assert
        response.EnsureSuccessStatusCode();
        var session = await response.Content.ReadFromJsonAsync<CreatePaymentSessionResponse>();

        Assert.NotNull(session);
        Assert.NotEqual(Guid.Empty, session.SessionId);
        Assert.NotEmpty(session.ClientToken);
        Assert.True(session.PaymentMethods.Any());
    }

    [Fact]
    public async Task CreatePaymentSession_WithMissingIdempotencyKey_ReturnsBadRequest()
    {
        // Arrange
        var request = new CreatePaymentSessionRequest
        {
            // ... populate with minimal valid data
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/checkout/sessions", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreatePaymentSession_WithDuplicateIdempotencyKey_ReturnsConflict()
    {
        // Arrange
        var request = new CreatePaymentSessionRequest
        {
            // ... populate with minimal valid data
        };
        var idempotencyKey = Guid.NewGuid().ToString();

        // Act
        using var firstResponse = await _client.PostAsJsonAsync("/api/checkout/sessions", request,
            headers: new() { { "Idempotency-Key", idempotencyKey } });
        using var secondResponse = await _client.PostAsJsonAsync("/api/checkout/sessions", request,
            headers: new() { { "Idempotency-Key", idempotencyKey } });

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);
    }

    [Theory]
    [InlineData("", "sv-SE")] // Empty currency
    [InlineData("SEK", "")] // Empty locale
    [InlineData("INVALID", "sv-SE")] // Invalid currency
    [InlineData("SEK", "invalid")] // Invalid locale
    public async Task CreatePaymentSession_WithInvalidRequest_ReturnsBadRequest(
        string currency,
        string locale)
    {
        // Arrange
        var request = new CreatePaymentSessionRequest
        {
            Currency = currency,
            Locale = locale,
            // ... other required fields
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/checkout/sessions", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.NotNull(errors);
        Assert.NotEmpty(errors.Errors);
    }

    [Fact]
    public async Task CreatePaymentSession_WithKlarnaApiFailure_ReturnsInternalError()
    {
        // Arrange
        var request = PaymentTestData.CreateValidSessionRequest();
        var headers = new Dictionary<string, string>
        {
            { "Idempotency-Key", Guid.NewGuid().ToString() }
        };

        // Configure WireMock to return 500
        _fixture.MockKlarnaApi
            .Given(Request.Create().WithPath("/payments/v1/sessions").UsingPost())
            .RespondWith(Response.Create()
                .WithStatusCode(500)
                .WithBody("Internal Server Error"));


        var response = await _client.PostAsJsonAsync("/api/checkout/sessions", request, headers);

        // Assert
        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task CreatePaymentSession_WithRetryableKlarnaError_EventuallySucceeds()
    {
        // Arrange
        var request = PaymentTestData.CreateValidSessionRequest();
        var headers = new Dictionary<string, string>
        {
            { "Idempotency-Key", Guid.NewGuid().ToString() }
        };

        _fixture.MockKlarnaApi
            .Given(Request.Create().WithPath("/payments/v1/sessions").UsingPost())
            .InScenario("RetryScenario")
            .WillSetStateTo("FirstFailure")
            .RespondWith(Response.Create().WithStatusCode(503));

        _fixture.MockKlarnaApi
            .Given(Request.Create().WithPath("/payments/v1/sessions").UsingPost())
            .InScenario("RetryScenario")
            .WhenStateIs("FirstFailure")
            .WillSetStateTo("SecondFailure")
            .RespondWith(Response.Create().WithStatusCode(503));

        _fixture.MockKlarnaApi
            .Given(Request.Create().WithPath("/payments/v1/sessions").UsingPost())
            .InScenario("RetryScenario")
            .WhenStateIs("SecondFailure")
            .RespondWith(Response.Create()
                .WithStatusCode(200)
                .WithHeader("Content-Type", "application/json")
                .WithBody(@"{
                    ""client_token"": ""test-token"",
                    ""session_id"": ""test-session"",
                    ""payment_methods"": []
                }"));

        // Act
        var response = await _client.PostAsJsonAsync("/api/checkout/sessions", request, headers);

        // Assert
        response.EnsureSuccessStatusCode();

        // Verify that we had exactly 3 requests (2 failures + 1 success)
        var requests = _fixture.MockKlarnaApi.FindLogEntries(Request.Create()
            .WithPath("/payments/v1/sessions")
            .UsingPost());
        Assert.Equal(3, requests.Count());
    }
}

