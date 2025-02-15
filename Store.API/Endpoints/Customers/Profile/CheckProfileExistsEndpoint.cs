using FastEndpoints;
using MediatR;
using Store.Application.Customers.Queries.Profile;

namespace Store.API.Endpoints.Customers.Profile;

/// <summary>
/// </summary>
public class CheckProfileExistsEndpoint : EndpointWithoutRequest
{
    private readonly IMediator _mediator;

    /// <summary>
    /// </summary>
    /// <param name="mediator"></param>
    public CheckProfileExistsEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <inheritdoc />
    public override void Configure()
    {
        AllowAnonymous();
        Get("/customers/profile/exists");
        Policies("RequireAuth"); // Use policy instead of Claims
        Description(d => d
            .Produces(200) // Profile Exists
            .Produces(404) // Profile Not Found
            .ProducesProblem(500) // Server Error
            .WithTags("Customer Profile"));
    }

    /// <inheritdoc />
    public override async Task HandleAsync(CancellationToken ct)
    {
        var query = new GetCustomerProfileQuery(); // Or a more efficient query to just check existence
        var result = await _mediator.Send(query, ct);

        if (result.IsSuccess)
            await SendOkAsync(ct); // 200 OK - Profile Exists
        else
            await SendNotFoundAsync(ct); // 404 Not Found - Profile Doesn't Exist
    }
}