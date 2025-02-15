using AutoMapper;
using MediatR;
using Store.Application.Common.Interfaces;
using Store.Application.Contracts;
using Store.Application.Customers.Models;
using Store.Domain.Common;

namespace Store.Application.Customers.Queries.Profile;

// Get Profile Query
public record GetCustomerProfileQuery : IRequest<Result<CustomerProfileDto>>;

public class GetCustomerProfileQueryHandler : IRequestHandler<GetCustomerProfileQuery, Result<CustomerProfileDto>>
{
    private readonly ICurrentUser _currentUser;
    private readonly ICustomerRepository _customerRepository;
    private readonly IMapper _mapper;

    public GetCustomerProfileQueryHandler(
        ICustomerRepository customerRepository,
        ICurrentUser currentUser,
        IMapper mapper)
    {
        _customerRepository = customerRepository;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<Result<CustomerProfileDto>> Handle(
        GetCustomerProfileQuery request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        if (string.IsNullOrEmpty(userId))
            return Result<CustomerProfileDto>.Failure(new Error("Auth.Required", "User is not authenticated"));

        var profile = await _customerRepository.GetByUserIdAsync(userId, cancellationToken);
        if (profile == null)
            return Result<CustomerProfileDto>.Failure(new Error("Profile.NotFound", "Profile not found"));
        var result = new CustomerProfileDto
        {
            Email = profile.Email.Value,
            Phone = profile.Phone?.Value ?? "",
            FirstName = profile.FirstName,
            LastName = profile.LastName
        };
        return Result<CustomerProfileDto>.Success(result);
    }
}