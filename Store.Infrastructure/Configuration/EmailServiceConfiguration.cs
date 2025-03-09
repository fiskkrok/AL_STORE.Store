using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using SendGrid;

using Store.Application.Contracts;
using Store.Infrastructure.Services;
using Store.Infrastructure.Services.Models;

namespace Store.Infrastructure.Configuration;

public static class EmailServiceConfiguration
{
    public static IServiceCollection AddEmailService(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configure email settings from appsettings.json
        services.Configure<EmailSettings>(
            configuration.GetSection("EmailSettings"));

        // Register SendGrid client as a singleton
        services.AddSingleton<ISendGridClient>(sp =>
        {
            var settings = configuration.GetSection("EmailSettings").Get<EmailSettings>();
            return new SendGridClient(settings?.ApiKey ?? string.Empty);
        });

        // Configure QuestPDF for receipt generation
        // QuestPDF.Settings.License = LicenseType.Community;

        // Register email service
        services.AddScoped<IEmailService, EmailService>();

        return services;
    }
}