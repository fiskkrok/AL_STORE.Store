using FastEndpoints;
using MediatR;
using Store.API.Endpoints.Payments.Mapper;
using Store.API.Endpoints.Payments.Models;
using Store.Application.Contracts;

namespace Store.API.Endpoints.Payments.Klarna;

/// <summary>
///     Endpoint to create a new payment session.
/// </summary>
/// <remarks>
///     This endpoint handles the creation of a new payment session. It ensures idempotency by checking the Idempotency-Key
///     header.
///     If the request is successful, it returns a 201 status code with the created payment session details.
///     If the Idempotency-Key header is missing or the request is a duplicate, it returns appropriate error responses.
/// </remarks>
/// <response code="201">Payment session created successfully.</response>
/// <response code="400">Bad request, typically due to missing Idempotency-Key header or validation errors.</response>
/// <response code="409">Conflict, indicating a duplicate request detected by the Idempotency-Key.</response>
/// <response code="500">Internal server error, typically due to unexpected errors during processing.</response>
public class
    CreateKlarnaSessionEndpoint : Endpoint<CreatePaymentSessionRequest, CreatePaymentSessionResponse, PaymentMapper>
{
    private readonly IIdempotencyService _idempotencyService;
    private readonly ILogger<CreateKlarnaSessionEndpoint> _logger;
    private readonly IMediator _mediator;

    /// <summary>
    /// </summary>
    /// <param name="mediator"></param>
    /// <param name="idempotencyService"></param>
    /// <param name="logger"></param>
    public CreateKlarnaSessionEndpoint(
        IMediator mediator,
        IIdempotencyService idempotencyService,
        ILogger<CreateKlarnaSessionEndpoint> logger)
    {
        _mediator = mediator;
        _idempotencyService = idempotencyService;
        _logger = logger;
    }

    /// <summary>
    /// </summary>
    public override void Configure()
    {
        Post("/payments/klarna/sessions");
        AllowAnonymous();
        Description(d => d
            .WithTags("Checkout")
            .Produces<CreatePaymentSessionResponse>(201)
            .ProducesProblem(400)
            .ProducesProblem(409) // Conflict for idempotency
            .WithName("CreatePaymentSession")
            .WithOpenApi());
    }

    /// <summary>
    /// </summary>
    /// <param name="req"></param>
    /// <param name="ct"></param>
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

            if (result is { IsSuccess: true, Value: not null })
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
                        AssetUrls = pm.AssetUrls,
                        Allowed = pm.Allowed
                    }).ToList()
                };

                await SendCreatedAtAsync<GetKlarnaSessionEndpoint>(
                    new { id = response.SessionId },
                    response,
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