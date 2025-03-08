﻿using System;
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
public record GetCustomerOrdersQuery : IRequest<Result<IReadOnlyList<OrderSummaryDto>>>;

public class GetCustomerOrdersQueryHandler : IRequestHandler<GetCustomerOrdersQuery, Result<IReadOnlyList<OrderSummaryDto>>>
{
    private readonly ICurrentUser _currentUser;
    private readonly IOrderRepository _orderRepository;
    private readonly IMapper _mapper;

    public GetCustomerOrdersQueryHandler(
        ICurrentUser currentUser,
        IOrderRepository orderRepository,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _orderRepository = orderRepository;
        _mapper = mapper;
    }

    public async Task<Result<IReadOnlyList<OrderSummaryDto>>> Handle(
        GetCustomerOrdersQuery request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        if (string.IsNullOrEmpty(userId))
            return Result<IReadOnlyList<OrderSummaryDto>>.Failure(
                new Error("Auth.Required", "User is not authenticated"));

        var orders = await _orderRepository.GetCustomerOrdersAsync(userId, cancellationToken);

        var orderDtos = orders.Select(order => new OrderSummaryDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            Created = order.Created,
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount.Amount,
            Currency = order.TotalAmount.Currency,
            OrderLineItems = order.OrderLines.Select(o => new OrderLineItemDto
            {
                ProductName = o.ProductName,
                Quantity = o.Quantity,
                LineTotal = o.LineTotal.Amount,
                UnitPrice = o.UnitPrice.Amount,
            }).ToList()
        }).ToList();

        return Result<IReadOnlyList<OrderSummaryDto>>.Success(orderDtos);
    }
}
