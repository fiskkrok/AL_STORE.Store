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
public class OrderStatusChangedConsumer : IConsumer<OrderStatusChangedEvent>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<OrderStatusChangedConsumer> _logger;
    private readonly IOrderRepository _orderRepository;

    public OrderStatusChangedConsumer(IEmailService emailService, ILogger<OrderStatusChangedConsumer> logger, IOrderRepository orderRepository)
    {
        _emailService = emailService;
        _logger = logger;
        _orderRepository = orderRepository;
    }

    public async Task Consume(ConsumeContext<OrderStatusChangedEvent> context)
    {
        
    }
}
