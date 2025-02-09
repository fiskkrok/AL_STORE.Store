using FastEndpoints;

using MediatR;
using Store.API.Endpoints.Customers.Models;
using Store.Application.Customers.Commands.Profile;
using Store.Domain.Entities.Customer;

namespace Store.API.Endpoints.Customers.Profile;

public class UpdateProfileEndpoint : Endpoint<UpdateProfileRequest, CustomerProfileResponse>
{
    private readonly IMediator _mediator;

    public UpdateProfileEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Put("/api/customers/profile");
        Claims("sub");
        Description(d => d
            .Produces<CustomerProfileResponse>(200)
            .ProducesProblem(400)
            .WithTags("Customer Profile"));
    }

    public override async Task HandleAsync(UpdateProfileRequest req, CancellationToken ct)
    {
        var command = new UpdateCustomerProfileCommand(
            FirstName: req.FirstName,
            LastName: req.LastName,
            Phone: req.Phone,
            Preferences: new CustomerPreferences(
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
            foreach (var error in result.Errors)
            {
                AddError(error.Message);
            }
            await SendErrorsAsync(400, ct);
        }
    }
}
