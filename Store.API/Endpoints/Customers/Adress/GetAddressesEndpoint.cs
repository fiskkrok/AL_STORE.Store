using FastEndpoints;
using Microsoft.OpenApi.Models;
using Store.Application.Common.Interfaces;
using Store.Application.Contracts;
using Store.Application.Payments.Models;

namespace Store.API.Endpoints.Customers.Adress;

public class GetAddressesEndpoint : EndpointWithoutRequest<List<AddressDto>>
{
    private readonly ICurrentUser _currentUser;
    private readonly ICustomerRepository _customerRepository;

    public GetAddressesEndpoint(ICustomerRepository customerRepository, ICurrentUser currentUser)
    {
        _customerRepository = customerRepository;
        _currentUser = currentUser;
    }

    public override void Configure()
    {
        Get("/customers/addresses");
        Policies("RequireAuth"); // Use policy instead of Claims
        Permissions("read:profile");
        Description(d => d
            .Produces<List<AddressDto>>()
            .WithTags("Customer Addresses")
            .WithOpenApi(operation => new OpenApiOperation
            {
                Summary = "Get customer addresses",
                Description = "Retrieves all addresses for the authenticated user"
            }));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = _currentUser.Id;
        if (string.IsNullOrEmpty(userId))
        {
            await SendUnauthorizedAsync(ct);
            return;
        }

        var customer = await _customerRepository.GetByUserIdAsync(userId, ct);
        if (customer == null)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        var addresses = await _customerRepository.GetAddressesAsync(customer.Id, ct);

        await SendOkAsync(addresses.Select(a => new AddressDto
        {
            Id = a.Id.ToString(),
            Street = a.Street,
            City = a.City,
            State = a.State,
            Country = a.Country,
            PostalCode = a.PostalCode,
            IsDefault = a.IsDefault,
            Type = a.Type.ToString().ToLower()
        }).ToList(), ct);
    }
}