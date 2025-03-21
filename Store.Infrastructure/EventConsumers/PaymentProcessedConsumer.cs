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
    private readonly ILogger<PaymentProcessedConsumer> _logger;

    public PaymentProcessedConsumer(ILogger<PaymentProcessedConsumer> logger)
    {
        _logger = logger;
    }

    public Task Consume(ConsumeContext<PaymentProcessedEvent> context)
    {
        var message = context.Message;
        _logger.LogInformation(
            "Payment processed for order {OrderId}: {Success}",
            message.OrderId, message.Successful ? "Successful" : "Failed");

        // Handle payment processed

        return Task.CompletedTask;
    }
}