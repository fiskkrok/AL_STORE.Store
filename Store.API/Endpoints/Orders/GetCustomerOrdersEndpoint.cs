using FastEndpoints;
using MediatR;
using Store.Application.Orders.Queries;
using Store.Application.Orders.Models;

namespace Store.API.Endpoints.Orders;

public class GetCustomerOrdersEndpoint : EndpointWithoutRequest<CustomerOrdersResponse>
{
    private readonly IMediator _mediator;

    public GetCustomerOrdersEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Get("/customers/orders");
        Policies("RequireAuth");
        Description(d => d
            .Produces<CustomerOrdersResponse>()
            .ProducesProblem(401)
            .WithTags("Customer Orders"));
        Permissions("read:profile");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var query = new GetCustomerOrdersQuery();
        var result = await _mediator.Send(query, ct);

        if (result.IsSuccess)
        {
            await SendOkAsync(new CustomerOrdersResponse { Orders = result.Value }, ct);
        }
        else
        {
            foreach (var error in result.Errors) AddError(error.Message);
            await SendErrorsAsync(400, ct);
        }
    }
}

public class CustomerOrdersResponse
{
    public IReadOnlyList<OrderSummaryDto> Orders { get; init; } = Array.Empty<OrderSummaryDto>();
}