using MediatR;
using Store.Application.Contracts;
using Store.Application.Orders.Models;
using Store.Application.Payments.Models;
using Store.Domain.Common;
using Store.Domain.Entities.Order;
using Store.Domain.Enums;

namespace Store.Application.Orders.Queries;

public record GetOrderConfirmationQuery(string PaymentReference) : IRequest<Result<OrderConfirmationDto>>;

public class GetOrderConfirmationQueryHandler : IRequestHandler<GetOrderConfirmationQuery, Result<OrderConfirmationDto>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICustomerRepository _customerRepository;

    public GetOrderConfirmationQueryHandler(
        IOrderRepository orderRepository,
        ICustomerRepository customerRepository)
    {
        _orderRepository = orderRepository;
        _customerRepository = customerRepository;
    }

    public async Task<Result<OrderConfirmationDto>> Handle(
        GetOrderConfirmationQuery request,
        CancellationToken cancellationToken)
    {
        Order? order = await _orderRepository.GetByPaymentReferenceAsync(request.PaymentReference, cancellationToken);

        if (order == null)
            return Result<OrderConfirmationDto>.Failure(
                new Error("Order.NotFound", "Order not found"));

        // Get customer email
        string customerEmail = string.Empty;
        if (!string.IsNullOrEmpty(order.CustomerId))
        {
            customerEmail = await _customerRepository.GetEmailAddressByCustomerIdAsync(
                order.CustomerId, cancellationToken);
        }

        // Get payment method from payment attempts
        var paymentMethod = "Unknown";
        var paymentAttempt = order.PaymentAttempts.FirstOrDefault(p => p.Status == PaymentStatus.Successful);
        if (paymentAttempt != null)
        {
            // Use the payment method from the successful payment attempt
            //paymentMethod = paymentAttempt.PaymentMethod;
            paymentMethod = PaymentMethod.Klarna.ToString();
        }
        else if (order.KlarnaOrderReference == request.PaymentReference)
        {
            paymentMethod = "Klarna";
        }

        var confirmationDto = new OrderConfirmationDto
        {
            OrderNumber = order.OrderNumber,
            Status = order.Status.ToString(),
            CustomerEmail = customerEmail,
            Total = order.TotalAmount.Amount,
            CreatedAt = order.Created,
            PaymentMethod = paymentMethod,
            ShippingAddress = new AddressDto
            {
                Street = order.ShippingAddress.Street,
                City = order.ShippingAddress.City,
                State = order.ShippingAddress.State,
                Country = order.ShippingAddress.Country,
                PostalCode = order.ShippingAddress.PostalCode
            },
            Items = order.OrderLines.Select(line => new OrderConfirmationItemDto
            {
                ProductId = line.ProductId,
                Name = line.ProductName,
                Quantity = line.Quantity,
                Price = line.UnitPrice.Amount
            }).ToList()
        };

        return Result<OrderConfirmationDto>.Success(confirmationDto);
    }
}
