using FastEndpoints;
using FluentValidation;
using Microsoft.OpenApi.Models;
using Store.Application.Common.Interfaces;
using Store.Application.Contracts;
using Store.Application.Customers.Models;
using Store.Domain.Entities.Customer;
using Store.Domain.ValueObjects;
using AddressDto = Store.Application.Payments.Models.AddressDto;

namespace Store.API.Endpoints.Customer;

// Customer Profile Endpoints
public class CustomerProfileEndpoints
{
    public class CreateProfileRequest
    {
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string? Phone { get; init; }
    }

    public class CreateProfileValidator : Validator<CreateProfileRequest>
    {
        public CreateProfileValidator()
        {
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
            RuleFor(x => x.Phone).Matches(@"^\+?[\d\s-]{8,}$").When(x => !string.IsNullOrEmpty(x.Phone));
        }
    }

    public class CreateProfileEndpoint : Endpoint<CreateProfileRequest>
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ICurrentUser _currentUser;

        public CreateProfileEndpoint(ICustomerRepository customerRepository, ICurrentUser currentUser)
        {
            _customerRepository = customerRepository;
            _currentUser = currentUser;
        }

        public override void Configure()
        {
            Post("/api/customers/profile");
            Claims("sub");
            Description(d => d
                .Produces<CustomerProfileDto>(201)
                .Produces<ErrorResponse>(400)
                .Produces<ErrorResponse>(409)
                .WithTags("Customer Profile")
                .WithOpenApi(operation => new OpenApiOperation
                {
                    Summary = "Create customer profile",
                    Description = "Creates a new customer profile for the authenticated user",
                    Security = new List<OpenApiSecurityRequirement>
                    {
                        new()
                        {
                            {
                                new OpenApiSecurityScheme
                                {
                                    Reference = new OpenApiReference
                                    {
                                        Type = ReferenceType.SecurityScheme,
                                        Id = "Bearer"
                                    }
                                },
                                new List<string>()
                            }
                        }
                    }
                }));
        }

        public override async Task HandleAsync(CreateProfileRequest req, CancellationToken ct)
        {
            var userId = _currentUser.Id;
            if (string.IsNullOrEmpty(userId))
            {
                await SendUnauthorizedAsync(ct);
                return;
            }

            var existingProfile = await _customerRepository.GetByEmailAsync(req.Email, ct);
            if (existingProfile != null)
            {
                AddError("A profile with this email already exists");
                await SendErrorsAsync(409, ct);
                return;
            }

            var profile = new CustomerProfile(
                userId,
                req.FirstName,
                req.LastName,
                req.Email,
                req.Phone);

            await _customerRepository.AddAsync(profile, ct);
            await SendCreatedAtAsync<GetProfileEndpoint>(null, profile, cancellation: ct);
        }
    }

    public class GetProfileEndpoint : EndpointWithoutRequest<CustomerProfileDto>
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ICurrentUser _currentUser;

        public GetProfileEndpoint(ICustomerRepository customerRepository, ICurrentUser currentUser)
        {
            _customerRepository = customerRepository;
            _currentUser = currentUser;
        }

        public override void Configure()
        {
            Get("/api/customers/profile");
            Claims("sub");
            Description(d => d
                .Produces<CustomerProfileDto>(200)
                .Produces(404)
                .WithTags("Customer Profile")
                .WithOpenApi(operation => new OpenApiOperation
                {
                    Summary = "Get customer profile",
                    Description = "Retrieves the profile of the authenticated user"
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

            var profile = await _customerRepository.GetByUserIdAsync(userId, ct);
            if (profile == null)
            {
                await SendNotFoundAsync(ct);
                return;
            }

            await SendOkAsync(new CustomerProfileDto
            {
                FirstName = profile.FirstName,
                LastName = profile.LastName,
                Email = profile.Email.Value,
                Phone = profile.Phone?.Value

            }, ct);
        }
    }
}

// Address Management Endpoints
public class AddressEndpoints
{
    public class CreateAddressRequest
    {
        public string Street { get; init; } = string.Empty;
        public string City { get; init; } = string.Empty;
        public string State { get; init; } = string.Empty;
        public string Country { get; init; } = string.Empty;
        public string PostalCode { get; init; } = string.Empty;
        public bool IsDefault { get; init; }
        public string Type { get; init; } = "shipping"; // shipping or billing
    }

    public class CreateAddressValidator : Validator<CreateAddressRequest>
    {
        public CreateAddressValidator()
        {
            RuleFor(x => x.Street).NotEmpty().MaximumLength(200);
            RuleFor(x => x.City).NotEmpty().MaximumLength(100);
            RuleFor(x => x.State).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Country).NotEmpty().MaximumLength(2);
            RuleFor(x => x.PostalCode).NotEmpty().MaximumLength(20);
            RuleFor(x => x.Type).Must(x => x == "shipping" || x == "billing");
        }
    }

    public class CreateAddressEndpoint : Endpoint<CreateAddressRequest>
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ICurrentUser _currentUser;

        public CreateAddressEndpoint(ICustomerRepository customerRepository, ICurrentUser currentUser)
        {
            _customerRepository = customerRepository;
            _currentUser = currentUser;
        }

        public override void Configure()
        {
            Post("/api/customers/addresses");
            Claims("sub");
            Description(d => d
                .Produces<AddressDto>(201)
                .Produces<ErrorResponse>(400)
                .WithTags("Customer Addresses")
                .WithOpenApi(operation => new OpenApiOperation
                {
                    Summary = "Add customer address",
                    Description = "Adds a new address for the authenticated user"
                }));
        }

        public override async Task HandleAsync(CreateAddressRequest req, CancellationToken ct)
        {
            var userId = _currentUser.Id;
            if (string.IsNullOrEmpty(userId))
            {
                await SendUnauthorizedAsync(ct);
                return;
            }

            var addressResult = Address.Create(
                req.Street,
                req.City,
                req.State,
                req.Country,
                req.PostalCode);

            if (!addressResult.IsSuccess)
            {
                addressResult.Errors.ToList().ForEach(error => AddError(error.Message));
                await SendErrorsAsync(400, ct);
                return;
            }

            var customer = await _customerRepository.GetByUserIdAsync(userId, ct);
            if (customer == null)
            {
                await SendNotFoundAsync(ct);
                return;
            }

            var address = new CustomerAddress(
                customer.Id,
                addressResult.Value!,
                req.Type == "shipping" ? AddressType.Shipping : AddressType.Billing,
                req.IsDefault);

            await _customerRepository.AddAddressAsync(address, ct);
            await SendCreatedAtAsync<GetAddressesEndpoint>(null, address, cancellation: ct);
        }
    }

    public class GetAddressesEndpoint : EndpointWithoutRequest<List<AddressDto>>
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ICurrentUser _currentUser;

        public GetAddressesEndpoint(ICustomerRepository customerRepository, ICurrentUser currentUser)
        {
            _customerRepository = customerRepository;
            _currentUser = currentUser;
        }

        public override void Configure()
        {
            Get("/api/customers/addresses");
            Claims("sub");
            Description(d => d
                .Produces<List<AddressDto>>(200)
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
                Id = a.Id,
                Street = a.Address.Street,
                City = a.Address.City,
                State = a.Address.State,
                Country = a.Address.Country,
                PostalCode = a.Address.PostalCode,
                IsDefault = a.IsDefault,
                Type = a.Type.ToString().ToLower()
            }).ToList(), ct);
        }
    }
}

public class ErrorResponse
{
    public string Type { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public Dictionary<string, string[]> Errors { get; init; } = new();
}