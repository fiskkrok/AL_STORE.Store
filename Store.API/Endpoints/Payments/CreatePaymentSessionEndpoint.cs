using FastEndpoints;

using MediatR;

using Store.API.Endpoints.Payments.Mapper;
using Store.API.Endpoints.Payments.Models;
using Store.Application.Contracts;

namespace Store.API.Endpoints.Payments;

public class CreatePaymentSessionEndpoint : Endpoint<CreatePaymentSessionRequest, CreatePaymentSessionResponse, PaymentMapper>
{
    private readonly IMediator _mediator;
    private readonly IIdempotencyService _idempotencyService;
    private readonly ILogger<CreatePaymentSessionEndpoint> _logger;

    public CreatePaymentSessionEndpoint(
        IMediator mediator,
        IIdempotencyService idempotencyService,
        ILogger<CreatePaymentSessionEndpoint> logger)
    {
        _mediator = mediator;
        _idempotencyService = idempotencyService;
        _logger = logger;
    }

    public override void Configure()
    {
        Post("/api/checkout/sessions");
        AllowAnonymous();
        Description(d => d
            .WithTags("Checkout")
            .Produces<CreatePaymentSessionResponse>(201)
            .ProducesProblem(400)
            .ProducesProblem(409) // Conflict for idempotency
            .WithName("CreatePaymentSession")
            .WithOpenApi());
    }

    public override async Task HandleAsync(CreatePaymentSessionRequest req, CancellationToken ct)
    {
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

            var command = Map.ToEntity(req);

            var result = await _mediator.Send(command, ct);

            if (result.IsSuccess && result.Value != null)
            {
                // Mark request as processed only if successful
                await _idempotencyService.MarkOperationAsProcessedAsync(idempotencyKey, ct);

                var response = new CreatePaymentSessionResponse
                {
                    SessionId = result.Value.SessionId,
                    ClientToken = result.Value.ClientToken,
                    ExpiresAt = result.Value.ExpiresAt,
                    PaymentMethods = result.Value.PaymentMethods.Select(pm => new PaymentMethodResponse
                    {
                        Id = pm.Id,
                        Name = pm.Name,
                        Allowed = pm.Allowed
                    }).ToList()
                };

                await SendCreatedAtAsync<GetPaymentSessionEndpoint>(
                    routeValues: new { id = response.SessionId },
                    responseBody: response,
                    cancellation: ct);
            }
            else
            {
                foreach (var error in result.Errors)
                {
                    if (error.Code.StartsWith("Klarna."))
                    {
                        await SendErrorsAsync(500, ct);
                        return;
                    }
                    AddError(error.Message);
                }
                await SendErrorsAsync(400, ct);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment session");
            AddError("An unexpected error occurred");
            await SendErrorsAsync(500, ct);
        }
    }
}