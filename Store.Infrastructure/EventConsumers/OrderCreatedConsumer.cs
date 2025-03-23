using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using MassTransit;

using Microsoft.Extensions.Logging;

using Store.Application.Contracts;
using Store.Contracts.Events;

namespace Store.Infrastructure.EventConsumers;
public class OrderCreatedConsumer : IConsumer<OrderCreatedEvent>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<OrderCreatedConsumer> _logger;
    private readonly IOrderRepository _orderRepository;

    public OrderCreatedConsumer(
        IEmailService emailService,
        ILogger<OrderCreatedConsumer> logger, IOrderRepository orderRepository)
    {
        _emailService = emailService;
        _logger = logger;
        _orderRepository = orderRepository;
    }

    public async Task Consume(ConsumeContext<OrderCreatedEvent> context)
    {
        var orderId = context.Message.OrderId;
        var customerName = context.Message.CustomerName;
        var customerEmail = context.Message.CustomerEmail;
        _logger.LogInformation("Consuming OrderCreatedEvent for order {OrderId}, customer {CustomerName}, email {CustomerEmail}", orderId, customerName, customerEmail);

        try
        {
            var order = await _orderRepository.GetByIdAsync(orderId);

            if (order == null)
            {
                _logger.LogWarning("Order {OrderId} not found", orderId);
                return;
            }

            // Send confirmation email
            await _emailService.SendOrderConfirmationAsync(
                order,
                CancellationToken.None);

            _logger.LogInformation("Order confirmation email sent for order {OrderId}", orderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing OrderCreatedEvent for order {OrderId}", orderId);
            throw; // MassTransit will handle retry
        }
    }
}
