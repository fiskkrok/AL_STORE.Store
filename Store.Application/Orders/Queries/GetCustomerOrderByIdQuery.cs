using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;

using MediatR;

using Store.Application.Common.Interfaces;
using Store.Application.Contracts;
using Store.Application.Orders.Models;
using Store.Domain.Common;

namespace Store.Application.Orders.Queries;
public record GetCustomerOrderByIdQuery(Guid OrderId) : IRequest<Result<OrderDetailDto>>;

public class GetCustomerOrderByIdQueryHandler : IRequestHandler<GetCustomerOrderByIdQuery, Result<OrderDetailDto>>
{
    private readonly ICurrentUser _currentUser;
    private readonly IOrderRepository _orderRepository;
    private readonly IMapper _mapper;

    public GetCustomerOrderByIdQueryHandler(
        ICurrentUser currentUser,
        IOrderRepository orderRepository,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _orderRepository = orderRepository;
        _mapper = mapper;
    }

    public async Task<Result<OrderDetailDto>> Handle(
        GetCustomerOrderByIdQuery request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        if (string.IsNullOrEmpty(userId))
            return Result<OrderDetailDto>.Failure(
                new Error("Auth.Required", "User is not authenticated"));

        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);

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
            BillingAddress = new()
            {
                Street = order.BillingAddress.Street,
                City = order.BillingAddress.City,
                State = order.BillingAddress.State,
                Country = order.BillingAddress.Country,
                PostalCode = order.BillingAddress.PostalCode
            },
            ShippingAddress = new()
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
