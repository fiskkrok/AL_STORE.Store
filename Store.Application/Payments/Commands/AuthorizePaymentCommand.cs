﻿using System.Text.Json.Serialization;
using MediatR;

using Microsoft.Extensions.Logging;

using Store.Application.Contracts;
using Store.Domain.Exceptions;

namespace Store.Application.Payments.Commands;

public class AuthorizePaymentCommand : IRequest<AuthorizePaymentResponse>
{
    public string AuthorizationToken { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public string IdempotencyKey { get; set; } = string.Empty;
}

public class AuthorizePaymentHandler : IRequestHandler<AuthorizePaymentCommand, AuthorizePaymentResponse>
{
    private readonly IKlarnaService _klarnaService;
    private readonly ILogger<AuthorizePaymentHandler> _logger;
    private readonly IOrderRepository _orderRepository;
    private readonly IPaymentSessionRepository _sessionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AuthorizePaymentHandler(
        ILogger<AuthorizePaymentHandler> logger,
        IKlarnaService klarnaService,
        IPaymentSessionRepository sessionRepository,
        IOrderRepository orderRepository,
        IUnitOfWork unitOfWork)
    {
        _logger = logger;
        _klarnaService = klarnaService;
        _sessionRepository = sessionRepository;
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AuthorizePaymentResponse> Handle(AuthorizePaymentCommand request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Authorizing payment with token: {TokenPartial}...",
            request.AuthorizationToken.Substring(0, Math.Min(8, request.AuthorizationToken.Length)));

        // Get the payment session
        var session = await _sessionRepository.GetByIdAsync(Guid.Parse(request.SessionId), cancellationToken);
        if (session == null)
        {
            _logger.LogWarning("Payment session not found: {SessionId}", request.SessionId);
            throw new NotFoundException("PaymentSession", request.SessionId);
        }

        // Get the order associated with the session
        var order = await _orderRepository.GetByIdAsync(session.OrderId, cancellationToken);
        if (order == null)
        {
            _logger.LogWarning("Order not found for session: {SessionId}", request.SessionId);
            throw new NotFoundException("Order", session.OrderId);
        }

        // Authorize with Klarna
        var result = await _klarnaService.AuthorizePaymentAsync(
            request.SessionId,
            request.AuthorizationToken,
            order, 
            cancellationToken);

        if (!result.IsSuccess)
        {
            _logger.LogError("Klarna authorization failed: {ErrorMessage}",
                string.Join(", ", result.Errors.Select(e => e.Message)));
            throw new ApplicationException($"Klarna authorization failed: {result.Errors.First().Message}");
        }
        // Update payment session status
        session.Authorize();
        session.IncrementAttempt();
        _sessionRepository.Update(session);

        // If Klarna gave us an order reference, store it
        if (!string.IsNullOrEmpty(result.Value?.OrderId))
        {
            order.SetKlarnaReference(result.Value.OrderId);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment authorized successfully. Klarna order ID: {KlarnaOrderId}", result.Value?.OrderId);

        return new AuthorizePaymentResponse
        {
            PaymentId = session.Id,
            Status = "Authorized",
            OrderId = session.OrderId.ToString()
        };
    }
}

public class AuthorizePaymentResponse
{
    public Guid PaymentId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
}


public class KlarnaResponse
{
    [JsonPropertyName("authorized_payment_method")]
    public AuthorizedPaymentMethod AuthorizedPaymentMethod { get; set; }
    [JsonPropertyName("KlarnaResponse")]
    public string FraudStatus { get; set; }
    [JsonPropertyName("fraud_status")]
    public string OrderId { get; set; }
    [JsonPropertyName("redirect_url")]
    public string RedirectUrl { get; set; }
}
public class AuthorizedPaymentMethod
{
    public string Type { get; set; }
}
