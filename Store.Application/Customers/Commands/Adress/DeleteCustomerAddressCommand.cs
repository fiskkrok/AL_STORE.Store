using MediatR;
using Store.Application.Common.Interfaces;
using Store.Application.Contracts;
using Store.Domain.Common;

namespace Store.Application.Customers.Commands.Adress;

public record DeleteCustomerAddressCommand(Guid addressId) : IRequest<Result<bool>>;

public class DeleteCustomerAddressCommandHandler : IRequestHandler<DeleteCustomerAddressCommand, Result<bool>>
{
    private readonly ICurrentUser _currentUser;
    private readonly ICustomerRepository _customerRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCustomerAddressCommandHandler(
        ICustomerRepository customerRepository,
        ICurrentUser currentUser,
        IUnitOfWork unitOfWork)
    {
        _customerRepository = customerRepository;
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(
        DeleteCustomerAddressCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        if (string.IsNullOrEmpty(userId))
            return Result<bool>.Failure(new Error("Auth.Required", "User is not authenticated"));

        var profile = await _customerRepository.GetByUserIdAsync(userId, cancellationToken);
        if (profile == null)
            return Result<bool>.Failure(new Error("Profile.NotFound", "Profile not found"));

        var address = profile.Addresses.FirstOrDefault(a => a.Id == request.addressId);
        if (address == null)
            return Result<bool>.Failure(new Error("Address.NotFound", "Address not found"));

        profile.RemoveAddress(address);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}