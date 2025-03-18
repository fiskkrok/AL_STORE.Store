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
public class PaymentProcessedConsumer : IConsumer<PaymentProcessedEvent>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<PaymentProcessedEvent> _logger;
    private readonly IOrderRepository _orderRepository;

    public PaymentProcessedConsumer(IOrderRepository orderRepository, ILogger<PaymentProcessedEvent> logger, IEmailService emailService)
    {
        _orderRepository = orderRepository;
        _logger = logger;
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<PaymentProcessedEvent> context)
    {
        throw new NotImplementedException();
    }
}
