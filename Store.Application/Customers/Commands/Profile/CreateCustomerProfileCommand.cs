using AutoMapper;
using MediatR;
using Store.Application.Common.Interfaces;
using Store.Application.Contracts;
using Store.Application.Customers.Models;
using Store.Domain.Common;
using Store.Domain.Entities.Customer;

namespace Store.Application.Customers.Commands.Profile;

public record CreateCustomerProfileCommand(
    string FirstName,
    string LastName,
    string Email,
    string? Phone) : IRequest<Result<CustomerProfileDto>>;

public class
    CreateCustomerProfileCommandHandler : IRequestHandler<CreateCustomerProfileCommand, Result<CustomerProfileDto>>
{
    private readonly ICurrentUser _currentUser;
    private readonly ICustomerRepository _customerRepository;
    private readonly IMapper _mapper;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCustomerProfileCommandHandler(
        ICustomerRepository customerRepository,
        ICurrentUser currentUser,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _customerRepository = customerRepository;
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<CustomerProfileDto>> Handle(
        CreateCustomerProfileCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        if (string.IsNullOrEmpty(userId))
            return Result<CustomerProfileDto>.Failure(new Error("Auth.Required", "User is not authenticated"));

        var existingProfile = await _customerRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingProfile != null)
            return Result<CustomerProfileDto>.Failure(new Error("Profile.Duplicate",
                "A profile with this email already exists"));

        var profile = new CustomerProfile(
            userId,
            request.FirstName,
            request.LastName,
            request.Email,
            request.Phone);

        await _customerRepository.AddAsync(profile, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerProfileDto>.Success(_mapper.Map<CustomerProfileDto>(profile));
    }
}