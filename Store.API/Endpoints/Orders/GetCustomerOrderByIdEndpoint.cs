using FastEndpoints;
using MediatR;
using Store.Application.Orders.Models;
using Store.Application.Orders.Queries;

namespace Store.API.Endpoints.Orders;

public class GetCustomerOrderByIdRequest
{
    public Guid Id { get; init; }
}

public class GetCustomerOrderByIdEndpoint : Endpoint<GetCustomerOrderByIdRequest, CustomerOrderResponse>
{
    private readonly IMediator _mediator;

    public GetCustomerOrderByIdEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Get("/customers/orders/{Id}");
        Policies("RequireAuth");
        Description(d => d
            .Produces<CustomerOrderResponse>()
            .ProducesProblem(401)
            .ProducesProblem(404)
            .WithTags("Customer Orders"));
        Permissions("read:profile");
    }

    public override async Task HandleAsync(GetCustomerOrderByIdRequest req, CancellationToken ct)
    {
        var query = new GetCustomerOrderByIdQuery(req.Id);
        var result = await _mediator.Send(query, ct);

        if (result.IsSuccess)
        {
            await SendOkAsync(new CustomerOrderResponse { Order = result.Value }, ct);
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

public class CustomerOrderResponse
{
    public OrderDetailDto Order { get; init; } = new();
}