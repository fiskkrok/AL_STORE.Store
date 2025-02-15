using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;
using Store.Application.Contracts;
using Store.Application.Payments.Models;
using Store.Domain.Common;
using Store.Domain.Entities.Order;
using Store.Domain.ValueObjects;

namespace Store.Application.Payments.Commands;

public class CreatePaymentSessionCommand : IRequest<Result<PaymentSessionDto>>
{
    public List<OrderLineDto> Items { get; init; } = new();
    public string Currency { get; init; } = string.Empty;
    public string Locale { get; init; } = string.Empty;
    public CustomerDto Customer { get; init; } = new();
}

public class
    CreatePaymentSessionCommandHandler : IRequestHandler<CreatePaymentSessionCommand, Result<PaymentSessionDto>>
{
    private readonly IKlarnaService _klarnaService;
    private readonly ILogger<CreatePaymentSessionCommandHandler> _logger;
    private readonly IMapper _mapper;
    private readonly IOrderRepository _orderRepository;
    private readonly IPaymentSessionRepository _sessionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePaymentSessionCommandHandler(
        IOrderRepository orderRepository,
        IPaymentSessionRepository sessionRepository,
        IKlarnaService klarnaService,
        IUnitOfWork unitOfWork,
        ILogger<CreatePaymentSessionCommandHandler> logger, IMapper mapper)
    {
        _orderRepository = orderRepository;
        _sessionRepository = sessionRepository;
        _klarnaService = klarnaService;
        _unitOfWork = unitOfWork;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<Result<PaymentSessionDto>> Handle(
        CreatePaymentSessionCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Calculate order total
            var totalAmount = request.Items.Sum(i => i.UnitPrice * i.Quantity);
            var orderTotal = Money.FromDecimal(totalAmount, request.Currency);

            // Create shipping address value object
            var shippingAddressResult = request.Customer.ShippingAddress != null
                ? Address.Create(
                    request.Customer.ShippingAddress.Street,
                    request.Customer.ShippingAddress.City,
                    request.Customer.ShippingAddress.State,
                    request.Customer.ShippingAddress.Country,
                    request.Customer.ShippingAddress.PostalCode)
                : Result<Address>.Failure(new Error("Address.Required", "Shipping address is required"));

            if (!shippingAddressResult.IsSuccess)
                return Result<PaymentSessionDto>.Failure(shippingAddressResult.Errors);

            // Create a separate instance for billing address
            var billingAddressResult = Address.Create(
                request.Customer.ShippingAddress.Street,
                request.Customer.ShippingAddress.City,
                request.Customer.ShippingAddress.State,
                request.Customer.ShippingAddress.Country,
                request.Customer.ShippingAddress.PostalCode);

            if (!billingAddressResult.IsSuccess)
                return Result<PaymentSessionDto>.Failure(billingAddressResult.Errors);

            // Generate order number
            var orderNumber = await _orderRepository.GenerateOrderNumberAsync(cancellationToken);

            // Create order lines
            var orderLines = request.Items.Select(item =>
                new OrderLine(
                    Guid.NewGuid(), // Order ID will be set when adding to order
                    item.ProductId,
                    item.ProductName,
                    item.Sku,
                    item.Quantity,
                    Money.FromDecimal(item.UnitPrice, request.Currency)
                )).ToList();

            // Create order with separate address instances
            var order = new Order(
                orderNumber,
                null, // Guest checkout
                shippingAddressResult.Value!,
                billingAddressResult.Value!, // Using separate instance
                orderTotal,
                orderLines);

            // Create Klarna session
            var klarnaSession = await _klarnaService.CreateSessionAsync(
                order,
                request.Locale,
                cancellationToken);

            if (!klarnaSession.IsSuccess)
                return Result<PaymentSessionDto>.Failure(klarnaSession.Errors);

            // Create payment session with its own Money instance
            var paymentSession = new PaymentSession(
                order.Id,
                klarnaSession.Value?.ClientToken,
                "klarna",
                Money.FromDecimal(orderTotal.Amount, orderTotal.Currency));

            // Save everything
            await _orderRepository.AddAsync(order, cancellationToken);
            await _sessionRepository.AddAsync(paymentSession, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<PaymentSessionDto>.Success(new PaymentSessionDto
            {
                SessionId = paymentSession.Id,
                ClientToken = paymentSession.ClientToken,
                ExpiresAt = paymentSession.ExpiresAt,
                PaymentMethods = klarnaSession.Value.PaymentMethodCategories.Select(o => new PaymentMethodDto
                {
                    Allowed = true,
                    AssetUrls = o.AssetUrls,
                    Identifier = o.Identifier,
                    Name = o.Name
                }).ToList()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment session");
            return Result<PaymentSessionDto>.Failure(
                new Error("PaymentSession.Creation.Failed", "Failed to create payment session"));
        }
    }
}