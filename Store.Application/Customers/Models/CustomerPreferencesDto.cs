namespace Store.Application.Customers.Models;

public class CustomerPreferencesDto
{
    public bool MarketingEmails { get; init; }
    public bool OrderNotifications { get; init; }
    public bool NewsletterSubscribed { get; init; }
    public string PreferredLanguage { get; init; } = string.Empty;
    public string PreferredCurrency { get; init; } = string.Empty;
}