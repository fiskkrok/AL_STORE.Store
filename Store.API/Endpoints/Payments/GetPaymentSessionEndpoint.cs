using FastEndpoints;
using Store.API.Endpoints.Payments.Models;
using Store.Application.Contracts;

namespace Store.API.Endpoints.Payments;

public class GetPaymentSessionEndpoint : Endpoint<GetPaymentSessionRequest, CreatePaymentSessionResponse>
{
    private readonly ILogger<GetPaymentSessionEndpoint> _logger;
    private readonly IPaymentSessionRepository _sessionRepository;

    public GetPaymentSessionEndpoint(
        IPaymentSessionRepository sessionRepository,
        ILogger<GetPaymentSessionEndpoint> logger)
    {
        _sessionRepository = sessionRepository;
        _logger = logger;
    }

    public override void Configure()
    {
        Get("/checkout/sessions/{Id}");
        AllowAnonymous();
        Description(d => d
            .WithTags("Checkout")
            .Produces<CreatePaymentSessionResponse>()
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
                new()
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