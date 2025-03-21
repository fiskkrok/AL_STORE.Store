using FastEndpoints;
using MediatR;
using Store.API.Endpoints.Customers.Models;
using Store.Application.Customers.Commands.Profile;
using Store.Application.Customers.Models;

namespace Store.API.Endpoints.Customers.Profile;

/// <summary>
/// </summary>
/// <param name="Auth0Id"></param>
/// <param name="Email"></param>
/// <param name="FirstName"></param>
/// <param name="LastName"></param>
/// <param name="Phone"></param>
public record ProfilePayload(
    string? Auth0Id,
    string? Email,
    string? FirstName,
    string? LastName,
    string? Phone
);
/// <summary>
/// 
/// </summary>
public class CreateProfileEndpoint : Endpoint<ProfilePayload, CustomerProfileResponse> // No Request DTO needed
{
    private readonly IMediator _mediator;
    /// <summary>
    /// 
    /// </summary>
    public CreateProfileEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }
    /// <summary>
    /// 
    /// </summary>
    public override void Configure()
    {
        Post("/customers/profile");
        Policies("RequireAuth"); // Use policy instead of Claims
        Description(d => d
            .Produces<CustomerProfileResponse>(201)
            .ProducesProblem(400)
            .WithTags("Customer Profile"));
    }
    /// <summary>
    /// 
    /// </summary>
    public override async Task HandleAsync(ProfilePayload payload, CancellationToken ct)
    {
        var sub = payload.Auth0Id;
        var email = payload.Email;
        var firstName = payload.FirstName ?? "";
        var lastName = payload.LastName ?? "";
        var phone = payload.Phone ?? "";


        var command = new CreateCustomerProfileCommand( // Use claims data
            firstName,
            lastName,
            email ?? "",
            null); // Or get phone from claims if available

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await SendCreatedAtAsync<GetProfileEndpoint>( // Adjust route if needed
                null,
                new CustomerProfileResponse { Profile = result.Value ?? new CustomerProfileDto() },
                cancellation: ct);
        }
        else
        {
            foreach (var error in result.Errors) AddError(error.Message);
            await SendErrorsAsync(400, ct);
        }
    }
}