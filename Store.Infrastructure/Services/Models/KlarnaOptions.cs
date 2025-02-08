namespace Store.Infrastructure.Services.Models;

public class KlarnaOptions
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ApiUrl { get; set; } = string.Empty;
    public string TermsUrl { get; set; } = string.Empty;
    public string CheckoutUrl { get; set; } = string.Empty;
    public string ConfirmationUrl { get; set; } = string.Empty;
    public string WebhookUrl { get; set; } = string.Empty;
}