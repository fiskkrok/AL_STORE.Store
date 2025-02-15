using FastEndpoints;
using MediatR;
using Store.API.Endpoints.Customers.Models;
using Store.Application.Customers.Commands.Profile;
using Store.Domain.Entities.Customer;

namespace Store.API.Endpoints.Customers.Profile;

/// <summary>
/// </summary>
public class UpdateProfileEndpoint : Endpoint<UpdateProfileRequest, CustomerProfileResponse>
{
    private readonly IMediator _mediator;

    /// <summary>
    /// </summary>
    /// <param name="mediator"></param>
    public UpdateProfileEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <inheritdoc />
    public override void Configure()
    {
        Put("/customers/profile");
        Policies("RequireAuth"); // Use policy instead of Claims
        Description(d => d
            .Produces<CustomerProfileResponse>()
            .ProducesProblem(400)
            .WithTags("Customer Profile"));
        Permissions("write:profile");
    }

    /// <inheritdoc />
    public override async Task HandleAsync(UpdateProfileRequest req, CancellationToken ct)
    {
        var command = new UpdateCustomerProfileCommand(
            req.FirstName,
            req.LastName,
            req.Phone,
            new CustomerPreferences(
                req.Preferences.MarketingEmails,
                req.Preferences.OrderNotifications,
                req.Preferences.NewsletterSubscribed,
                req.Preferences.PreferredLanguage,
                req.Preferences.PreferredCurrency));

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await SendOkAsync(new CustomerProfileResponse { Profile = result.Value }, ct);
        }
        else
        {
            foreach (var error in result.Errors) AddError(error.Message);
            await SendErrorsAsync(400, ct);
        }
    }
}