using FastEndpoints;

using Store.API.Endpoints.Payments.Models;
using Store.Application.Contracts;

namespace Store.API.Endpoints.Payments.Klarna;

/// <summary>
/// Endpoint for retrieving a payment session based on its identifier.
/// </summary>
public class GetKlarnaSessionEndpoint : Endpoint<GetPaymentSessionRequest, CreatePaymentSessionResponse>
{
    private readonly ILogger<GetKlarnaSessionEndpoint> _logger;
    private readonly IPaymentSessionRepository _sessionRepository;

    /// <summary>
    /// Initializes a new instance of the <see cref="GetKlarnaSessionEndpoint"/> class.
    /// </summary>
    /// <param name="sessionRepository">The repository for accessing payment sessions.</param>
    /// <param name="logger">The logger instance.</param>
    public GetKlarnaSessionEndpoint(
        IPaymentSessionRepository sessionRepository,
        ILogger<GetKlarnaSessionEndpoint> logger)
    {
        _sessionRepository = sessionRepository;
        _logger = logger;
    }

    /// <summary>
    /// Configures the endpoint route and metadata.
    /// </summary>
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

    /// <summary>
    /// Handles the incoming request to retrieve a payment session.
    /// </summary>
    /// <param name="req">The request containing the payment session identifier.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
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
        _logger.LogInformation("Returning payment session {Id}", session.Id);
        await SendOkAsync(response, ct);
    }
}
