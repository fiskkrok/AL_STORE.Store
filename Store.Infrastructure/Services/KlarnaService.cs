﻿using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Store.Application.Contracts;
using Store.Application.Payments.Commands;
using Store.Domain.Common;
using Store.Domain.Entities.Order;
using Store.Infrastructure.Services.Models;

namespace Store.Infrastructure.Services;

public class KlarnaService : IKlarnaService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<KlarnaService> _logger;
    private readonly KlarnaOptions _options;

    public KlarnaService(
        HttpClient httpClient,
        IOptions<KlarnaOptions> options,
        ILogger<KlarnaService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _options = options.Value;

        // Configure base URL
        _httpClient.BaseAddress = new Uri(_options.ApiUrl);

        // Configure Basic Authentication
        var authString = $"{_options.Username}:{_options.Password}";
        var base64Auth = Convert.ToBase64String(Encoding.UTF8.GetBytes(authString));
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", base64Auth);

        // Configure headers Klarna expects
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<Result<KlarnaSessionResponse>> CreateSessionAsync(
        Order order,
        string locale,
        CancellationToken ct = default)
    {
        try
        {
            _logger.LogInformation("Creating Klarna session for order {OrderId}", order.Id);

            var request = new KlarnaSessionRequest
            {
                PurchaseCountry = locale.Split('-')[1].ToUpper(),
                PurchaseAmount = (long)(order.TotalAmount.Amount * 100),
                PurchaseCurrency = order.TotalAmount.Currency.ToUpper(),
                Locale = locale,
                OrderLines = order.OrderLines.Select(line => new KlarnaOrderLine
                {
                    Name = line.ProductName,
                    Reference = line.Sku ?? line.ProductId.ToString(),
                    Quantity = line.Quantity,
                    UnitPrice = (long)(line.UnitPrice.Amount * 100),
                    TotalAmount = (long)(line.LineTotal.Amount * 100)
                }).ToList(),
                MerchantUrls = new KlarnaMerchantUrls
                {
                    Terms = _options.TermsUrl,
                    Checkout = _options.CheckoutUrl,
                    Confirmation = _options.ConfirmationUrl,
                    Push = _options.WebhookUrl
                },
                Intent = "buy"
            };

            // Serialize and log the request
            var jsonRequest = JsonSerializer.Serialize(request);
            _logger.LogDebug("Klarna session request: {@Request}", request);
            _logger.LogDebug("Serialized Klarna session request: {JsonRequest}", jsonRequest);

            var response = await _httpClient.PostAsJsonAsync("payments/v1/sessions", request, ct);


            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Klarna session creation failed: {Error}", errorContent);

                // Parse error for more specific handling
                var errorResponse = JsonSerializer.Deserialize<KlarnaErrorResponse>(errorContent);
                return Result<KlarnaSessionResponse>.Failure(new Error(
                    $"Klarna.{errorResponse?.ErrorCode ?? "Unknown"}",
                    errorResponse?.ErrorMessage ?? "Unknown error"));
            }

            var sessionResponse = await response.Content.ReadFromJsonAsync<KlarnaSessionResponse>(
                ct);

            if (sessionResponse == null)
                return Result<KlarnaSessionResponse>.Failure(
                    new Error("Klarna.Session.Invalid", "Invalid response from Klarna"));

            _logger.LogInformation("Successfully created Klarna session for order {OrderId}", order.Id);
            return Result<KlarnaSessionResponse>.Success(sessionResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating Klarna session for order {OrderId}", order.Id);
            return Result<KlarnaSessionResponse>.Failure(
                new Error("Klarna.Session.Error", "An error occurred creating the session"));
        }
    }

    public async Task<Result<KlarnaResponse>> AuthorizePaymentAsync(
        string sessionId,
        string authToken,
        Order order,
        CancellationToken ct = default)
    {
        try
        {
            _logger.LogInformation("Authorizing payment with Klarna for session {SessionId}", sessionId);

            var endpoint = $"payments/v1/authorizations/{authToken}/order";

            // Build request
            var request = new KlarnaAuthorizationRequest
            {
                AuthToken = authToken,
                // Add these required fields:
                PurchaseCountry = "SE", // Or get from locale
                PurchaseCurrency = order.TotalAmount.Currency,
                OrderAmount = (long)(order.TotalAmount.Amount * 100), // Convert to cents/öre
                OrderLines = order.OrderLines.Select(line => new KlarnaOrderLine
                {
                    Name = line.ProductName,
                    Reference = line.Sku ?? line.ProductId.ToString(),
                    Quantity = line.Quantity,
                    UnitPrice = (long)(line.UnitPrice.Amount * 100),
                    TotalAmount = (long)(line.LineTotal.Amount * 100)
                }).ToList()
            };

            _logger.LogDebug("Sending authorization request to Klarna: {Endpoint}", endpoint);

            var response = await _httpClient.PostAsJsonAsync(endpoint, request, ct);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Klarna payment authorization failed: {StatusCode} {Error}",
                    response.StatusCode, error);

                // Parse error response to get more specific error code
                KlarnaErrorResponse? errorResponse = null;
                try
                {
                    errorResponse = JsonSerializer.Deserialize<KlarnaErrorResponse>(error);
                }
                catch
                {
                    /* Ignore deserialization errors */
                }

                return Result<KlarnaResponse>.Failure(
                    new Error(
                        $"Klarna.Authorization.{errorResponse?.ErrorCode ?? response.StatusCode.ToString()}",
                        errorResponse?.ErrorMessage ?? "Payment authorization failed"));
            }

            var authResponse = await response.Content.ReadFromJsonAsync<KlarnaResponse>(ct);

            if (authResponse?.OrderId == null)
                return Result<KlarnaResponse>.Failure(
                    new Error("Klarna.Authorization.Invalid", "Invalid authorization response"));

            _logger.LogInformation("Klarna payment authorization successful. Order ID: {OrderId}",
                authResponse.OrderId);

            return Result<KlarnaResponse>.Success(authResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error authorizing Klarna payment");
            return Result<KlarnaResponse>.Failure(
                new Error("Klarna.Authorization.Error", "An error occurred during authorization"));
        }
    }

    public async Task<Result<bool>> CapturePaymentAsync(
        string klarnaOrderId,
        CancellationToken ct = default)
    {
        try
        {
            var response = await _httpClient.PostAsync(
                $"ordermanagement/v1/orders/{klarnaOrderId}/captures",
                null,
                ct);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Klarna payment capture failed: {Error}", error);
                return Result<bool>.Failure(
                    new Error("Klarna.Capture.Failed", "Payment capture failed"));
            }

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error capturing Klarna payment");
            return Result<bool>.Failure(
                new Error("Klarna.Capture.Error", "An error occurred during capture"));
        }
    }
}