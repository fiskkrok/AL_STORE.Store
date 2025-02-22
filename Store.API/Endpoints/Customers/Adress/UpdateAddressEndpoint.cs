using FastEndpoints;
using MediatR;
using Store.API.Endpoints.Customers.Models;
using Store.Application.Customers.Commands.Adress;
using Store.Domain.Entities.Customer;

namespace Store.API.Endpoints.Customers.Adress;

/// <summary>
/// </summary>
public class UpdateAddressRequest : AddAddressRequest
{
}

public class UpdateAddressEndpoint : Endpoint<UpdateAddressRequest, AddressResponse>
{
    private readonly IMediator _mediator;

    public UpdateAddressEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Put("/customers/addresses/{id}");
        Policies("RequireAuth"); // Use policy instead of Claims
        Permissions("write:profile");
        Description(d => d
            .Produces<AddressResponse>()
            .ProducesProblem(400)
            .Produces(404)
            .WithTags("Customer Addresses"));
    }

    public override async Task HandleAsync(UpdateAddressRequest req, CancellationToken ct)
    {
        var addressId = Route<Guid>("id");
        var command = new UpdateCustomerAddressCommand(
            addressId,
            Enum.Parse<AddressType>(req.Type, true),
            req.FirstName,
            req.LastName,
            req.Street,
            req.StreetNumber,
            req.Apartment,
            req.PostalCode,
            req.City,
            req.State,
            req.Country,
            req.Phone,
            req.IsDefault);

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await SendOkAsync(new AddressResponse { Address = result.Value }, ct);
        }
        else if (result.Errors.Any(e => e.Code == "Address.NotFound"))
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