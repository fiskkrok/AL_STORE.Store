using FastEndpoints;
using MediatR;
using Store.API.Endpoints.Customers.Models;
using Store.Application.Customers.Commands.Adress;
using Store.Domain.Entities.Customer;

namespace Store.API.Endpoints.Customers.Adress;

public class UpdateAddressRequest : AddAddressRequest { }

public class UpdateAddressEndpoint : Endpoint<UpdateAddressRequest, AddressResponse>
{
    private readonly IMediator _mediator;

    public UpdateAddressEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Put("/api/customers/addresses/{id}");
        Claims("sub");
        Description(d => d
            .Produces<AddressResponse>(200)
            .ProducesProblem(400)
            .Produces(404)
            .WithTags("Customer Addresses"));
    }

    public override async Task HandleAsync(UpdateAddressRequest req, CancellationToken ct)
    {
        var addressId = Route<Guid>("id");
        var command = new UpdateCustomerAddressCommand(
            AddressId: addressId,
            Type: Enum.Parse<AddressType>(req.Type, true),
            FirstName: req.FirstName,
            LastName: req.LastName,
            Street: req.Street,
            StreetNumber: req.StreetNumber,
            Apartment: req.Apartment,
            PostalCode: req.PostalCode,
            City: req.City,
            State: req.State,
            Country: req.Country,
            Phone: req.Phone,
            IsDefault: req.IsDefault);

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
            foreach (var error in result.Errors)
            {
                AddError(error.Message);
            }
            await SendErrorsAsync(400, ct);
        }
    }
}
