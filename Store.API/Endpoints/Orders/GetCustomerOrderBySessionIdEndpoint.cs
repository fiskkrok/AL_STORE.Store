using FastEndpoints;

using MediatR;

using Store.Application.Orders.Queries;

namespace Store.API.Endpoints.Orders;



public class GetCustomerOrderBySessionIdEndpoint : Endpoint<GetOrderByIdRequest, OrderResponse>
{
    private readonly IMediator _mediator;

    public GetCustomerOrderBySessionIdEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Get("/customers/orders/by-klarna/{Id}");
        Policies("RequireAuth");
        Description(d => d
            .Produces<OrderResponse>()
            .ProducesProblem(401)
            .ProducesProblem(404)
            .WithTags("Customer Orders"));
        Permissions("read:profile");
    }

    public override async Task HandleAsync(GetOrderByIdRequest req, CancellationToken ct)
    {
        var query = new GetOrderByIdQuery(Guid.Empty, true, req.Id.ToString());
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
