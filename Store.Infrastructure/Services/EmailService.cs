using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using Store.Application.Contracts;
using Store.Domain.Common;
using Store.Domain.Entities.Order;
using Store.Infrastructure.Services.Models;

namespace Store.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ISendGridClient _client;
    private readonly ILogger<EmailService> _logger;
    private readonly EmailSettings _settings;

    public EmailService(
        IOptions<EmailSettings> settings,
        ISendGridClient client,
        ILogger<EmailService> logger)
    {
        _logger = logger;
        _settings = settings.Value;
        _client = client;
    }

    public async Task<Result<bool>> SendOrderConfirmationAsync(Order order, CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrEmpty(order.CustomerId))
            {
                _logger.LogWarning("Cannot send order confirmation email: No customer ID specified for order {OrderId}",
                    order.Id);
                return Result<bool>.Failure(new Error("Email.NoRecipient", "No recipient specified for email"));
            }

            var customerEmail = await GetCustomerEmailAsync(order.CustomerId);
            if (string.IsNullOrEmpty(customerEmail))
            {
                _logger.LogWarning(
                    "Cannot send order confirmation email: Could not find email for customer {CustomerId}",
                    order.CustomerId);
                return Result<bool>.Failure(new Error("Email.NoRecipient", "No recipient specified for email"));
            }

            var msg = new SendGridMessage
            {
                From = new EmailAddress(_settings.FromEmail, _settings.FromName),
                Subject = $"Order Confirmation #{order.OrderNumber}",
                PlainTextContent = BuildOrderConfirmationText(order),
                HtmlContent = BuildOrderConfirmationHtml(order)
            };

            msg.AddTo(customerEmail);

            // Generate and attach receipt PDF if needed
            var receiptPdf = await GenerateReceiptPdfAsync(order);
            if (receiptPdf != null)
            {
                var attachment = Convert.ToBase64String(receiptPdf);
                msg.AddAttachment("receipt.pdf", attachment, "application/pdf");
            }

            var response = await _client.SendEmailAsync(msg, ct);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Order confirmation email sent successfully for order {OrderId}", order.Id);
                return Result<bool>.Success(true);
            }

            var responseBody = await response.Body.ReadAsStringAsync(ct);
            _logger.LogError("Failed to send order confirmation email. Status Code: {StatusCode}, Body: {ResponseBody}",
                response.StatusCode, responseBody);

            return Result<bool>.Failure(new Error("Email.SendFailed", "Failed to send email"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending order confirmation email for order {OrderId}", order.Id);
            return Result<bool>.Failure(new Error("Email.Exception", "An error occurred while sending email"));
        }
    }

    public async Task<Result<bool>> SendOrderShippedAsync(Order order, string trackingNumber,
        CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrEmpty(order.CustomerId))
            {
                _logger.LogWarning("Cannot send order shipped email: No customer ID specified for order {OrderId}",
                    order.Id);
                return Result<bool>.Failure(new Error("Email.NoRecipient", "No recipient specified for email"));
            }

            var customerEmail = await GetCustomerEmailAsync(order.CustomerId);
            if (string.IsNullOrEmpty(customerEmail))
            {
                _logger.LogWarning("Cannot send order shipped email: Could not find email for customer {CustomerId}",
                    order.CustomerId);
                return Result<bool>.Failure(new Error("Email.NoRecipient", "No recipient specified for email"));
            }

            var msg = new SendGridMessage
            {
                From = new EmailAddress(_settings.FromEmail, _settings.FromName),
                Subject = $"Your Order #{order.OrderNumber} Has Shipped!",
                PlainTextContent = BuildOrderShippedText(order, trackingNumber),
                HtmlContent = BuildOrderShippedHtml(order, trackingNumber)
            };

            msg.AddTo(customerEmail);

            var response = await _client.SendEmailAsync(msg, ct);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Order shipped email sent successfully for order {OrderId}", order.Id);
                return Result<bool>.Success(true);
            }

            var responseBody = await response.Body.ReadAsStringAsync(ct);
            _logger.LogError("Failed to send order shipped email. Status Code: {StatusCode}, Body: {ResponseBody}",
                response.StatusCode, responseBody);

            return Result<bool>.Failure(new Error("Email.SendFailed", "Failed to send email"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending order shipped email for order {OrderId}", order.Id);
            return Result<bool>.Failure(new Error("Email.Exception", "An error occurred while sending email"));
        }
    }

    private async Task<string> GetCustomerEmailAsync(string customerId)
    {
        // This is just a placeholder - in a real implementation, you would:
        // 1. Look up the customer in your database using the customerId
        // 2. Return their email address

        // For now, we'll just return a dummy email for testing
        return "customer@example.com";

        // In a real implementation with DI:
        // var customer = await _customerRepository.GetByIdAsync(customerId);
        // return customer?.Email?.Value;
    }

    private string BuildOrderConfirmationText(Order order)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"Thank you for your order #{order.OrderNumber}!");
        sb.AppendLine();
        sb.AppendLine("Order Details:");
        sb.AppendLine("-------------");

        foreach (var item in order.OrderLines)
            sb.AppendLine(
                $"{item.Quantity}x {item.ProductName} - {item.UnitPrice.Amount} {item.UnitPrice.Currency} each");

        sb.AppendLine();
        sb.AppendLine($"Total: {order.TotalAmount.Amount} {order.TotalAmount.Currency}");
        sb.AppendLine();
        sb.AppendLine("Shipping Address:");
        sb.AppendLine($"{order.ShippingAddress.Street}");
        sb.AppendLine(
            $"{order.ShippingAddress.City}, {order.ShippingAddress.State} {order.ShippingAddress.PostalCode}");
        sb.AppendLine($"{order.ShippingAddress.Country}");

        return sb.ToString();
    }

    private string BuildOrderConfirmationHtml(Order order)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<html><body>");
        sb.AppendLine($"<h1>Thank you for your order #{order.OrderNumber}!</h1>");

        sb.AppendLine("<h2>Order Details:</h2>");
        sb.AppendLine("<table style='width:100%; border-collapse: collapse;'>");
        sb.AppendLine(
            "<tr><th style='text-align:left;'>Product</th><th style='text-align:center;'>Quantity</th><th style='text-align:right;'>Price</th></tr>");

        foreach (var item in order.OrderLines)
        {
            sb.AppendLine("<tr>");
            sb.AppendLine($"<td style='padding:8px;'>{item.ProductName}</td>");
            sb.AppendLine($"<td style='padding:8px;text-align:center;'>{item.Quantity}</td>");
            sb.AppendLine(
                $"<td style='padding:8px;text-align:right;'>{item.UnitPrice.Amount} {item.UnitPrice.Currency}</td>");
            sb.AppendLine("</tr>");
        }

        sb.AppendLine("</table>");
        sb.AppendLine($"<p><strong>Total: {order.TotalAmount.Amount} {order.TotalAmount.Currency}</strong></p>");

        sb.AppendLine("<h2>Shipping Address:</h2>");
        sb.AppendLine("<p>");
        sb.AppendLine($"{order.ShippingAddress.Street}<br>");
        sb.AppendLine(
            $"{order.ShippingAddress.City}, {order.ShippingAddress.State} {order.ShippingAddress.PostalCode}<br>");
        sb.AppendLine($"{order.ShippingAddress.Country}");
        sb.AppendLine("</p>");

        sb.AppendLine("</body></html>");
        return sb.ToString();
    }

    private string BuildOrderShippedText(Order order, string trackingNumber)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"Your order #{order.OrderNumber} has shipped!");
        sb.AppendLine();
        sb.AppendLine($"Tracking Number: {trackingNumber}");
        sb.AppendLine();
        sb.AppendLine("Your order is on its way to:");
        sb.AppendLine($"{order.ShippingAddress.Street}");
        sb.AppendLine(
            $"{order.ShippingAddress.City}, {order.ShippingAddress.State} {order.ShippingAddress.PostalCode}");
        sb.AppendLine($"{order.ShippingAddress.Country}");

        return sb.ToString();
    }

    private string BuildOrderShippedHtml(Order order, string trackingNumber)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<html><body>");
        sb.AppendLine($"<h1>Your order #{order.OrderNumber} has shipped!</h1>");

        sb.AppendLine($"<p><strong>Tracking Number:</strong> {trackingNumber}</p>");

        sb.AppendLine("<h2>Shipping Address:</h2>");
        sb.AppendLine("<p>");
        sb.AppendLine($"{order.ShippingAddress.Street}<br>");
        sb.AppendLine(
            $"{order.ShippingAddress.City}, {order.ShippingAddress.State} {order.ShippingAddress.PostalCode}<br>");
        sb.AppendLine($"{order.ShippingAddress.Country}");
        sb.AppendLine("</p>");

        sb.AppendLine("</body></html>");
        return sb.ToString();
    }

    private Task<byte[]> GenerateReceiptPdfAsync(Order order)
    {
        try
        {
            // Use our ReceiptGenerator to create a PDF receipt
            var pdfBytes = ReceiptGenerator.GenerateReceipt(order);
            return Task.FromResult(pdfBytes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating receipt PDF for order {OrderId}", order.Id);
            return Task.FromResult<byte[]>(null);
        }
    }
}