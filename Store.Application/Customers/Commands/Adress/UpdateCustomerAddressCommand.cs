using AutoMapper;
using MediatR;
using Store.Application.Common.Interfaces;

using Store.Application.Contracts;
using Store.Application.Customers.Models;
using Store.Application.Payments.Models;
using Store.Domain.Common;
using Store.Domain.Entities.Customer;

namespace Store.Application.Customers.Commands.Adress;

public record UpdateCustomerAddressCommand(
    Guid AddressId,
    AddressType Type,
    string FirstName,
    string LastName,
    string Street,
    string StreetNumber,
    string? Apartment,
    string PostalCode,
    string City,
    string State,
    string Country,
    string? Phone,
    bool IsDefault) : IRequest<Result<AddressDto>>;

public class UpdateCustomerAddressCommandHandler : IRequestHandler<UpdateCustomerAddressCommand, Result<AddressDto>>
{
    private readonly ICustomerRepository _customerRepository;
    private readonly ICurrentUser _currentUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateCustomerAddressCommandHandler(
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

    public async Task<Result<AddressDto>> Handle(
        UpdateCustomerAddressCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        if (string.IsNullOrEmpty(userId))
            return Result<AddressDto>.Failure(new Error("Auth.Required", "User is not authenticated"));

        var profile = await _customerRepository.GetByUserIdAsync(userId, cancellationToken);
        if (profile == null)
            return Result<AddressDto>.Failure(new Error("Profile.NotFound", "Profile not found"));

        var address = profile.Addresses.FirstOrDefault(a => a.Id == request.AddressId);
        if (address == null)
            return Result<AddressDto>.Failure(new Error("Address.NotFound", "Address not found"));

        address.Update(
            request.FirstName,
            request.LastName,
            request.Street,
            request.StreetNumber,
            request.Apartment,
            request.PostalCode,
            request.City,
            request.State,
            request.Country,
            request.Phone);

        if (request.IsDefault)
            profile.SetAddressAsDefault(address);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<AddressDto>.Success(_mapper.Map<AddressDto>(address));
    }
}