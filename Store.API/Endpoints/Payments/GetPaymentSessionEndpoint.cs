using FastEndpoints;
using MediatR;
using Store.Application.Common.Interfaces;
using Store.Domain.Entities.Order;
using Microsoft.EntityFrameworkCore;
using Store.Application.Contracts;
using Store.API.Endpoints.Payments.Models;

namespace Store.API.Endpoints.Payments;

public class GetPaymentSessionEndpoint : Endpoint<GetPaymentSessionRequest, CreatePaymentSessionResponse>
{
    private readonly IPaymentSessionRepository _sessionRepository;
    private readonly ILogger<GetPaymentSessionEndpoint> _logger;

    public GetPaymentSessionEndpoint(
        IPaymentSessionRepository sessionRepository,
        ILogger<GetPaymentSessionEndpoint> logger)
    {
        _sessionRepository = sessionRepository;
        _logger = logger;
    }

    public override void Configure()
    {
        Get("/api/checkout/sessions/{Id}");
        AllowAnonymous();
        Description(d => d
            .WithTags("Checkout")
            .Produces<CreatePaymentSessionResponse>(200)
            .ProducesProblem(404)
            .WithName("GetPaymentSession")
            .WithOpenApi());
    }

    public override async Task HandleAsync(GetPaymentSessionRequest req, CancellationToken ct)
    {
        var session = await _sessionRepository.GetByIdAsync(req.Id, ct);

        if (session == null)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        // Map to response
        var response = new CreatePaymentSessionResponse
        {
            SessionId = session.Id,
            ClientToken = session.ClientToken,
            ExpiresAt = session.ExpiresAt,
            PaymentMethods = new List<PaymentMethodResponse>
            {
                new PaymentMethodResponse
                {
                    Id = session.PaymentMethod,
                    Name = "Klarna", // This could be more dynamic based on payment method
                    Allowed = !session.IsExpired() && session.CanRetry()
                }
            }
        };

        await SendOkAsync(response, ct);
    }
}