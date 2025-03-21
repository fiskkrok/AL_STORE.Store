using FastEndpoints;
using MediatR;
using Store.Application.Orders.Models;
using Store.Application.Orders.Queries;

namespace Store.API.Endpoints.Orders;

public class GetOrderConfirmationRequest
{
    public string PaymentReference { get; init; } = string.Empty;
}
/// <summary>
/// 
/// </summary>
public class GetOrderConfirmationEndpoint : Endpoint<GetOrderConfirmationRequest, OrderConfirmationResponse>
{
    private readonly IMediator _mediator;

    public GetOrderConfirmationEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }
    /// <summary>
    /// 
    /// </summary>
    public override void Configure()
    {
        Get("/orders/confirmation/{PaymentReference}");
        AllowAnonymous(); // Allow anonymous access for order confirmation
        Description(d => d
            .Produces<OrderConfirmationResponse>()
            .ProducesProblem(404)
            .WithTags("Orders"));
    }
    /// <summary>
    /// 
    /// </summary>
    public override async Task HandleAsync(GetOrderConfirmationRequest req, CancellationToken ct)
    {
        var query = new GetOrderConfirmationQuery(req.PaymentReference);
        var result = await _mediator.Send(query, ct);

        if (result.IsSuccess)
        {
            await SendOkAsync(new OrderConfirmationResponse { Confirmation = result.Value }, ct);
        }
        else if (result.Errors.Any(e => e.Code == "Order.NotFound"))
        {
            await SendNotFoundAsync(ct);
        }
        else
        {
            foreach (var error in result.Errors) AddError(error.Message);
            await SendErrorsAsync(400, ct);
        }
    }
}
/// <summary>
/// 
/// </summary>
public class OrderConfirmationResponse
{/// <summary>
    /// 
    /// </summary>
    public OrderConfirmationDto Confirmation { get; init; } = new();
}
