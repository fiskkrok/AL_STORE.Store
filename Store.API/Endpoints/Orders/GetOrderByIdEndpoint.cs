using FastEndpoints;
using MediatR;
using Store.Application.Orders.Models;
using Store.Application.Orders.Queries;

namespace Store.API.Endpoints.Orders;
/// <summary>
/// 
/// </summary>
public class GetOrderByIdRequest
{
    /// <summary>
    /// 
    /// </summary>
    public Guid Id { get; init; }
}
/// <summary>
/// 
/// </summary>
public class GetOrderByIdEndpoint : Endpoint<GetOrderByIdRequest, OrderResponse>
{
    private readonly IMediator _mediator;

    public GetOrderByIdEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }
    /// <summary>
    /// 
    /// </summary>
    public override void Configure()
    {
        Get("/customers/orders/{Id}");
        Policies("RequireAuth");
        Description(d => d
            .Produces<OrderResponse>()
            .ProducesProblem(401)
            .ProducesProblem(404)
            .WithTags("Customer Orders"));
        Permissions("read:profile");
    }
    /// <summary>
    /// 
    /// </summary>
    public override async Task HandleAsync(GetOrderByIdRequest req, CancellationToken ct)
    {
        var query = new GetOrderByIdQuery(req.Id);
        var result = await _mediator.Send(query, ct);

        if (result.IsSuccess)
        {
            await SendOkAsync(new OrderResponse { Order = result.Value }, ct);
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
public class OrderResponse
{
    public OrderDetailDto Order { get; init; } = new();
}