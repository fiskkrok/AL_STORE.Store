using FastEndpoints;
using FastEndpoints.Security;
using MediatR;
using Store.Application.Orders.Models;
using Store.Application.Orders.Queries;

namespace Store.API.Endpoints.Orders;

public class GetCustomerOrdersEndpoint : EndpointWithoutRequest<CustomerOrdersResponse>
{
    private readonly ILogger<GetCustomerOrdersEndpoint> _logger;
    private readonly IMediator _mediator;

    public GetCustomerOrdersEndpoint(IMediator mediator, ILogger<GetCustomerOrdersEndpoint> logger)
    {
        _mediator = mediator;
        _logger = logger;
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
        var query = new GetOrdersQuery();
        var result = await _mediator.Send(query, ct);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Got {Value} for customer {user}", result.Value, User.ClaimValue("name"));
            await SendOkAsync(new CustomerOrdersResponse { Orders = result.Value! }, ct);
        }
        else
        {
            foreach (var error in result.Errors) AddError(error.Message);
            _logger.LogError("Errors: {error}", string.Join(", ", result.Errors.Select(e => e)));
            await SendErrorsAsync(400, ct);
        }
    }
}

public class CustomerOrdersResponse
{
    public IReadOnlyList<OrderSummaryDto> Orders { get; init; } = Array.Empty<OrderSummaryDto>();
}