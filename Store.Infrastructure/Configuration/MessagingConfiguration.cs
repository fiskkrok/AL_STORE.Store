using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Store.Application.Common.Interfaces;
using Store.Infrastructure.EventConsumers;
using Store.Infrastructure.Persistence;
using Store.Infrastructure.Services;

namespace Store.Infrastructure.Configuration;
public static class MessagingConfiguration
{
    public static IServiceCollection AddMessagingInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {

        // Configure MassTransit
        services.AddMassTransit(x => {
            // Register consumers
            x.AddConsumer<OrderCreatedConsumer>();
            x.AddConsumer<OrderStatusChangedConsumer>();
            x.AddConsumer<PaymentProcessedConsumer>();

            // Add EntityFrameworkCore outbox
            x.AddEntityFrameworkOutbox<StoreDbContext>(o => {

                // For SQL Server
                o.UseSqlServer();

                // Configure delivery service
                o.QueryDelay = TimeSpan.FromSeconds(1);
                o.UseBusOutbox();

                // Add this optional setting for development
                o.DisableInboxCleanupService();
            });

            x.UsingRabbitMq((context, cfg) => {
                cfg.Host(configuration["RabbitMQ:Host"], "/", h => {
                    h.Username(configuration["RabbitMQ:Username"]);
                    h.Password(configuration["RabbitMQ:Password"]);
                });

                // Configure consumers
                cfg.ConfigureEndpoints(context);

                // Configure retry
                cfg.UseMessageRetry(r => {
                    r.Incremental(3, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(2));
                });

                // Optional: Add circuit breaker
                cfg.UseCircuitBreaker(cb => {
                    cb.TrackingPeriod = TimeSpan.FromMinutes(1);
                    cb.TripThreshold = 15;
                    cb.ActiveThreshold = 10;
                    cb.ResetInterval = TimeSpan.FromMinutes(5);
                });
            });
        });

        return services;
    }
}
