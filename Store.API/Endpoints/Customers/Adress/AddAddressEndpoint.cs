using FastEndpoints;
using MediatR;
using Store.API.Endpoints.Customer;
using Store.API.Endpoints.Customers.Models;
using Store.Application.Customers.Commands.Adress;
using Store.Domain.Entities.Customer;

namespace Store.API.Endpoints.Customers.Adress;

public class AddAddressRequest
{
    public string Type { get; init; } = "shipping";
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Street { get; init; } = string.Empty;
    public string StreetNumber { get; init; } = string.Empty;
    public string? Apartment { get; init; }
    public string PostalCode { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public bool IsDefault { get; init; }
}

public class AddAddressEndpoint : Endpoint<AddAddressRequest, AddressResponse>
{
    private readonly IMediator _mediator;

    public AddAddressEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/api/customers/addresses");
        Claims("sub");
        Description(d => d
            .Produces<AddressResponse>(201)
            .ProducesProblem(400)
            .WithTags("Customer Addresses"));
    }

    public override async Task HandleAsync(AddAddressRequest req, CancellationToken ct)
    {
        var command = new AddCustomerAddressCommand(
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
            await SendCreatedAtAsync<GetAddressesEndpoint>(
                routeValues: null,
                responseBody: new AddressResponse { Address = result.Value },
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