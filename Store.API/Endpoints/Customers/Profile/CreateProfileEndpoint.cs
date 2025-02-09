using FastEndpoints;

using MediatR;
using Store.API.Endpoints.Customers.Models;
using Store.Application.Customers.Commands.Profile;

namespace Store.API.Endpoints.Customers.Profile;

// Create Profile Endpoint
public class CreateProfileRequest
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
}

public class CreateProfileEndpoint : Endpoint<CreateProfileRequest, CustomerProfileResponse>
{
    private readonly IMediator _mediator;

    public CreateProfileEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/api/customers/profile");
        Claims("sub"); // Requires authenticated user
        Description(d => d
            .Produces<CustomerProfileResponse>(201)
            .ProducesProblem(400)
            .WithTags("Customer Profile"));
    }

    public override async Task HandleAsync(CreateProfileRequest req, CancellationToken ct)
    {
        var command = new CreateCustomerProfileCommand(
            FirstName: req.FirstName,
            LastName: req.LastName,
            Email: req.Email,
            Phone: req.Phone);

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await SendCreatedAtAsync<GetProfileEndpoint>(
                routeValues: null,
                responseBody: new CustomerProfileResponse { Profile = result.Value },
                cancellation: ct);
        }
        else
        {
            foreach (var error in result.Errors)
            {
                AddError(error.Message);
            }
            await SendErrorsAsync(400, ct);
        }
    }
}
