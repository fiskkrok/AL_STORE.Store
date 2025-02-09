using FastEndpoints;

using MediatR;
using Store.API.Endpoints.Customers.Models;
using Store.Application.Customers.Queries.Profile;

namespace Store.API.Endpoints.Customers.Profile;

public class GetProfileEndpoint : EndpointWithoutRequest<CustomerProfileResponse>
{
    private readonly IMediator _mediator;

    public GetProfileEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        AllowAnonymous();
        Get("/api/customers/profile");
        Claims("sub");
        Description(d => d
            .Produces<CustomerProfileResponse>(200)
            .Produces(404)
            .WithTags("Customer Profile"));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var query = new GetCustomerProfileQuery();
        var result = await _mediator.Send(query, ct);

        if (result.IsSuccess)
        {
            await SendOkAsync(new CustomerProfileResponse { Profile = result.Value }, ct);
        }
        else
        {
            await SendNotFoundAsync(ct);
        }
    }
}
