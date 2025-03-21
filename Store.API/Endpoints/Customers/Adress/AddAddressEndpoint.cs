using FastEndpoints;
using MediatR;
using Store.API.Endpoints.Customers.Models;
using Store.Application.Customers.Commands.Adress;
using Store.Application.Payments.Models;
using Store.Domain.Entities.Customer;

namespace Store.API.Endpoints.Customers.Adress;

/// <summary>
/// Request model for adding a customer address.
/// </summary>
public class AddAddressRequest
{
    /// <summary>
    /// Gets the type of address (e.g., shipping, billing).
    /// </summary>
    public string Type { get; init; } = "shipping";

    /// <summary>
    /// Gets the first name of the customer.
    /// </summary>
    public string FirstName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the last name of the customer.
    /// </summary>
    public string LastName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the street name of the address.
    /// </summary>
    public string Street { get; init; } = string.Empty;

    /// <summary>
    /// Gets the street number of the address.
    /// </summary>
    public string StreetNumber { get; init; } = string.Empty;

    /// <summary>
    /// Gets the apartment number of the address, if any.
    /// </summary>
    public string? Apartment { get; init; }

    /// <summary>
    /// Gets the postal code of the address.
    /// </summary>
    public string PostalCode { get; init; } = string.Empty;

    /// <summary>
    /// Gets the city of the address.
    /// </summary>
    public string City { get; init; } = string.Empty;

    /// <summary>
    /// Gets the state of the address.
    /// </summary>
    public string State { get; init; } = string.Empty;

    /// <summary>
    /// Gets the country of the address.
    /// </summary>
    public string Country { get; init; } = string.Empty;

    /// <summary>
    /// Gets the phone number associated with the address, if any.
    /// </summary>
    public string? Phone { get; init; }

    /// <summary>
    /// Gets a value indicating whether this address is the default address.
    /// </summary>
    public bool IsDefault { get; init; }
}


/// <summary>
/// 
/// </summary>
public class AddAddressEndpoint : Endpoint<AddAddressRequest, AddressResponse>
{
    private readonly IMediator _mediator;
    /// <summary>
    /// 
    /// </summary>
    public AddAddressEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }
    /// <summary>
    /// 
    /// </summary>
    public override void Configure()
    {
        AllowAnonymous();
        Post("/customers/addresses");
        Policies("RequireAuth"); // Use policy instead of Claims
        Description(d => d
            .Produces<AddressResponse>(201)
            .ProducesProblem(400)
            .WithTags("Customer Addresses"));
    }
    /// <summary>
    /// 
    /// </summary>
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