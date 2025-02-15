using MediatR;
using Store.Application.Common.Interfaces;
using Store.Application.Contracts;
using Store.Domain.Common;
using Store.Domain.Entities.Customer;

namespace Store.Application.Customers.Commands.Adress;

public record SetDefaultAddressCommand(Guid AddressId, AddressType Type) : IRequest<Result<bool>>;

public class SetDefaultAddressCommandHandler : IRequestHandler<SetDefaultAddressCommand, Result<bool>>
{
    private readonly ICurrentUser _currentUser;
    private readonly ICustomerRepository _customerRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SetDefaultAddressCommandHandler(
        ICustomerRepository customerRepository,
        ICurrentUser currentUser,
        IUnitOfWork unitOfWork)
    {
        _customerRepository = customerRepository;
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(
        SetDefaultAddressCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        if (string.IsNullOrEmpty(userId))
            return Result<bool>.Failure(new Error("Auth.Required", "User is not authenticated"));

        var profile = await _customerRepository.GetByUserIdAsync(userId, cancellationToken);
        if (profile == null)
            return Result<bool>.Failure(new Error("Profile.NotFound", "Profile not found"));

        var address = profile.Addresses.FirstOrDefault(a => a.Id == request.AddressId);
        if (address == null)
            return Result<bool>.Failure(new Error("Address.NotFound", "Address not found"));

        if (address.Type != request.Type)
            return Result<bool>.Failure(new Error("Address.InvalidType", "Address is not of the specified type"));

        profile.SetAddressAsDefault(address);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}