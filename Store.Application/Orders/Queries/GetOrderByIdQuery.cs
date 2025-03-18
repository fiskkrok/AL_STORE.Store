using AutoMapper;

using MediatR;
using Store.Application.Common.Interfaces;
using Store.Application.Contracts;
using Store.Application.Orders.Models;
using Store.Application.Payments.Models;
using Store.Domain.Common;
using Store.Domain.Entities.Order;

namespace Store.Application.Orders.Queries;

public record GetOrderByIdQuery(Guid OrderId, bool ByKlarna = false, string? KlarnaRef = "") : IRequest<Result<OrderDetailDto>>;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, Result<OrderDetailDto>>
{
    private readonly ICurrentUser _currentUser;
    private readonly IMapper _mapper;
    private readonly IOrderRepository _orderRepository;

    public GetOrderByIdQueryHandler(
        ICurrentUser currentUser,
        IOrderRepository orderRepository,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _orderRepository = orderRepository;
        _mapper = mapper;
    }

    public async Task<Result<OrderDetailDto>> Handle(
        GetOrderByIdQuery request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        if (string.IsNullOrEmpty(userId))
            return Result<OrderDetailDto>.Failure(
                new Error("Auth.Required", "User is not authenticated"));
        Order? order;
        if (request is { ByKlarna: true, KlarnaRef: not null })
        {
                order = await _orderRepository.GetByKlarnaAsync(request.KlarnaRef, cancellationToken);
        }
        else
        {
             order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        }

        if (order == null)
            return Result<OrderDetailDto>.Failure(
                new Error("Order.NotFound", "Order not found"));

        // Security check - ensure the order belongs to the current user
        if (order.CustomerId != userId)
            return Result<OrderDetailDto>.Failure(
                new Error("Order.NotFound", "Order not found"));

        var orderDto = new OrderDetailDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            Created = order.Created,
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount.Amount,
            Currency = order.TotalAmount.Currency,
            BillingAddress = new AddressDto
            {
                Street = order.BillingAddress.Street,
                City = order.BillingAddress.City,
                State = order.BillingAddress.State,
                Country = order.BillingAddress.Country,
                PostalCode = order.BillingAddress.PostalCode
            },
            ShippingAddress = new AddressDto
            {
                Street = order.ShippingAddress.Street,
                City = order.ShippingAddress.City,
                State = order.ShippingAddress.State,
                Country = order.ShippingAddress.Country,
                PostalCode = order.ShippingAddress.PostalCode
            },
            Items = order.OrderLines.Select(line => new OrderLineItemDto
            {
                ProductId = line.ProductId,
                ProductName = line.ProductName,
                Sku = line.Sku,
                Quantity = line.Quantity,
                UnitPrice = line.UnitPrice.Amount,
                LineTotal = line.LineTotal.Amount,
                Currency = line.UnitPrice.Currency
            }).ToList()
        };

        return Result<OrderDetailDto>.Success(orderDto);
    }
}