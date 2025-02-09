using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;
using MediatR;
using Store.Application.Common.Interfaces;
using Store.Application.Contracts;
using Store.Application.Customers.Models;
using Store.Domain.Common;
using Store.Domain.Entities.Customer;

namespace Store.Application.Customers.Commands.Profile;
// Update Profile
public record UpdateCustomerProfileCommand(
    string FirstName,
    string LastName,
    string? Phone,
    CustomerPreferences Preferences) : IRequest<Result<CustomerProfileDto>>;

public class UpdateCustomerProfileCommandHandler : IRequestHandler<UpdateCustomerProfileCommand, Result<CustomerProfileDto>>
{
    private readonly ICustomerRepository _customerRepository;
    private readonly ICurrentUser _currentUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateCustomerProfileCommandHandler(
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
        UpdateCustomerProfileCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        if (string.IsNullOrEmpty(userId))
            return Result<CustomerProfileDto>.Failure(new Error("Auth.Required", "User is not authenticated"));

        var profile = await _customerRepository.GetByUserIdAsync(userId, cancellationToken);
        if (profile == null)
            return Result<CustomerProfileDto>.Failure(new Error("Profile.NotFound", "Profile not found"));

        profile.Update(
            request.FirstName,
            request.LastName,
            request.Phone,
            request.Preferences);

        _customerRepository.Update(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerProfileDto>.Success(_mapper.Map<CustomerProfileDto>(profile));
    }
}
