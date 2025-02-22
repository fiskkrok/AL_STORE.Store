using FastEndpoints;
using MediatR;

using Store.Application.Contracts;
using Store.Application.Payments.Commands;

namespace Store.API.Endpoints.Payments;

public class AuthorizePaymentEndpoint :EndpointWithoutRequest<AuthorizePaymentResponse>
{
    private readonly IIdempotencyService _idempotencyService;
    private readonly ILogger<AuthorizePaymentEndpoint> _logger;
    private readonly IMediator _mediator;
    public AuthorizePaymentEndpoint(
        IMediator mediator,
        IIdempotencyService idempotencyService,
        ILogger<AuthorizePaymentEndpoint> logger)
    {
        _mediator = mediator;
        _idempotencyService = idempotencyService;
        _logger = logger;
    }
    public override void Configure()
    {
        Post("/payments/authorize");
        Description(d => d
            .WithTags("Payments")
            .Produces<AuthorizePaymentResponse>(200)
            .ProducesProblem(400)
            .ProducesProblem(409) // Conflict for idempotency
            .WithName("AuthorizePayment")
            .WithOpenApi());
    }
    public override async Task<AuthorizePaymentResponse> HandleAsync(CancellationToken ct)
    {
        var idempotencyKey = HttpContext.Request.Headers["Idempotency-Key"].ToString();
        if (string.IsNullOrEmpty(idempotencyKey))
        {
            AddError("Idempotency-Key header is required");
            await SendErrorsAsync(400);
            return null;
        }
        try
        {
            // Check if this request was already processed
            if (await _idempotencyService.IsOperationProcessedAsync(idempotencyKey))
            {
                _logger.LogWarning("Duplicate request detected with idempotency key: {Key}", idempotencyKey);
                await SendErrorsAsync(409);
                return null;
            }
            // Authorize payment
            var result = await _mediator.Send(new AuthorizePaymentCommand
            {
                IdempotencyKey = idempotencyKey
            });
            // Mark operation as processed
            await _idempotencyService.MarkOperationAsProcessedAsync(idempotencyKey);
            return new AuthorizePaymentResponse
            {
                PaymentId = result.PaymentId,
                Status = result.Status
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error authorizing payment");
            await SendErrorsAsync(500);
            return null;
        }
    }
}



public class AuthorizePaymentResponse
{
    public Guid PaymentId { get; set; }
    public string Status { get; set; }

}

