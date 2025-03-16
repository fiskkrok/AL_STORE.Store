using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using MassTransit;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Store.Application.Common.Interfaces;
using Store.Domain.Exceptions;
using Store.Infrastructure.Services;

namespace Store.Infrastructure.Configuration;
public static class MessagingConfiguration
{
    public static IServiceCollection AddMessagingInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        
        // Configure RabbitMQ Settings and Service
        services.Configure<RabbitMQSettings>(configuration.GetSection("RabbitMQ"));
        services.AddSingleton<RabbitMQService>();
        services.AddSingleton<IMessageBusService>(sp => sp.GetRequiredService<RabbitMQService>());
        services.AddHostedService(sp => sp.GetRequiredService<RabbitMQService>());

        // Configure MassTransit
        services.AddMassTransit(x =>
        {
            // Register consumers
            //x.AddConsumer<ProductCreatedConsumer>();
            //x.AddConsumer<StockUpdatedConsumer>();
            //x.AddConsumer<ImageProcessingConsumer>();

            x.UsingRabbitMq((context, cfg) =>
            {
                var rabbitMqSettings = configuration.GetSection("RabbitMQ").Get<RabbitMQSettings>()
                                       ?? throw new InvalidOperationException("RabbitMQ settings are missing");

                cfg.Host(rabbitMqSettings.Host, h =>
                {
                    h.Username(rabbitMqSettings.Username);
                    h.Password(rabbitMqSettings.Password);
                });

                // Configure error handling and retry policies
                cfg.UseMessageRetry(r =>
                {
                    r.Incremental(3, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(2));
                    r.Ignore<ValidationException>();
                });

                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}
