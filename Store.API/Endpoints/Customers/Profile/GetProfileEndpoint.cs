using FastEndpoints;
using MediatR;
using Serilog;
using Store.API.Endpoints.Customers.Models;
using Store.Application.Customers.Models;
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
        Get("/customers/profile");
        Policies("RequireAuth"); // Use policy instead of Claims
        Description(d => d
            .Produces<CustomerProfileResponse>()
            .ProducesProblem(404) // Return 404 if not found
            .WithTags("Customer Profile"));
        Permissions("read:profile");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var isAuthenticated = User.Identity?.IsAuthenticated;
        var claims = User.Claims.ToList(); // ToList() to avoid deferred execution issues in logging

        Log.Information("GetOrCreateProfileEndpoint - IsAuthenticated: {IsAuthenticated}", isAuthenticated);
        Log.Information("GetOrCreateProfileEndpoint - Claims: {@Claims}", claims); // Use structured logging for claims
        var query = new GetCustomerProfileQuery();
        var result = await _mediator.Send(query, ct);

        if (result.IsSuccess)
            await SendOkAsync(new CustomerProfileResponse { Profile = result.Value ?? new CustomerProfileDto() }, ct);
        else
            await SendNotFoundAsync(ct); // Return 404 if profile not found
    }
}