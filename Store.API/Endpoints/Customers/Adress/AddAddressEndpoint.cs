using FastEndpoints;
using MediatR;
using Store.API.Endpoints.Customers.Models;
using Store.Application.Customers.Commands.Adress;
using Store.Application.Payments.Models;
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
        AllowAnonymous();
        Post("/customers/addresses");
        //Policies("RequireAuth"); // Use policy instead of Claims
        //Permissions("write:profile");
        Description(d => d
            .Produces<AddressResponse>(201)
            .ProducesProblem(400)
            .WithTags("Customer Addresses"));
    }

    public override async Task HandleAsync(AddAddressRequest req, CancellationToken ct)
    {
        var command = new AddCustomerAddressCommand(
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
            await SendCreatedAtAsync<GetAddressesEndpoint>(
                null,
                new AddressResponse { Address = result.Value ?? new AddressDto() },
                cancellation: ct);
        }
        else
        {
            foreach (var error in result.Errors) AddError(error.Message);
            await SendErrorsAsync(400, ct);
        }
    }
}