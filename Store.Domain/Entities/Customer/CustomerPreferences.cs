using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Entities.Customer;
public class CustomerPreferences
{
    public bool MarketingEmails { get; private set; }
    public bool OrderNotifications { get; private set; }
    public bool NewsletterSubscribed { get; private set; }
    public string PreferredLanguage { get; private set; }
    public string PreferredCurrency { get; private set; }

    public CustomerPreferences(
        bool marketingEmails = false,
        bool orderNotifications = true,
        bool newsletterSubscribed = false,
        string preferredLanguage = "en",
        string preferredCurrency = "SEK")
    {
        MarketingEmails = marketingEmails;
        OrderNotifications = orderNotifications;
        NewsletterSubscribed = newsletterSubscribed;
        PreferredLanguage = preferredLanguage;
        PreferredCurrency = preferredCurrency;
    }

    public void Update(
        bool marketingEmails,
        bool orderNotifications,
        bool newsletterSubscribed,
        string preferredLanguage,
        string preferredCurrency)
    {
        MarketingEmails = marketingEmails;
        OrderNotifications = orderNotifications;
        NewsletterSubscribed = newsletterSubscribed;
        PreferredLanguage = preferredLanguage;
        PreferredCurrency = preferredCurrency;
    }
}
