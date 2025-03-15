using FastEndpoints;
using MediatR;
using Store.Application.Contracts;

namespace Store.API.Endpoints.Payments.Klarna;

public class AuthorizeKlarnaRequest
{
    public string AuthorizationToken { get; set; }
    public string SessionId { get; set; }
}

public class AuthorizeKlarnaEndpoint : Endpoint<AuthorizeKlarnaRequest, AuthorizePaymentResponse>
{
    private readonly IIdempotencyService _idempotencyService;
    private readonly ILogger<AuthorizeKlarnaEndpoint> _logger;
    private readonly IMediator _mediator;

    public AuthorizeKlarnaEndpoint(
        IMediator mediator,
        IIdempotencyService idempotencyService,
        ILogger<AuthorizeKlarnaEndpoint> logger)
    {
        _mediator = mediator;
        _idempotencyService = idempotencyService;
        _logger = logger;
    }

    public override void Configure()
    {
        Post("/payments/klarna/authorize");
        Description(d => d
            .WithTags("Payments")
            .Produces<AuthorizePaymentResponse>()
            .ProducesProblem(400)
            .ProducesProblem(409) // Conflict for idempotency
            .WithName("AuthorizePayment")
            .WithOpenApi());
    }

    public override async Task HandleAsync(AuthorizeKlarnaRequest req, CancellationToken ct)
    {
        // Validate input
        if (string.IsNullOrEmpty(req.AuthorizationToken) || string.IsNullOrEmpty(req.SessionId))
        {
            AddError("Authorization token and session ID are required");
            await SendErrorsAsync(400, ct);
            return;
        }

        var idempotencyKey = HttpContext.Request.Headers["Idempotency-Key"].ToString();
        if (string.IsNullOrEmpty(idempotencyKey))
        {
            AddError("Idempotency-Key header is required");
            await SendErrorsAsync(400, ct);
            return;
        }

        try
        {
            // Check if this request was already processed
            if (await _idempotencyService.IsOperationProcessedAsync(idempotencyKey, ct))
            {
                _logger.LogWarning("Duplicate request detected with idempotency key: {Key}", idempotencyKey);
                await SendErrorsAsync(409, ct);
                return;
            }

            // Authorize payment with Klarna
            var result = await _mediator.Send(new AuthorizePaymentCommand
            {
                AuthorizationToken = req.AuthorizationToken,
                SessionId = req.SessionId,
                IdempotencyKey = idempotencyKey
            }, ct);

            // Mark operation as processed
            await _idempotencyService.MarkOperationAsProcessedAsync(idempotencyKey, ct);

            // Return the result
            await SendOkAsync(result, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error authorizing payment");
            await SendErrorsAsync(500, ct);
        }
    }
}