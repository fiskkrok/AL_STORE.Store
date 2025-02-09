using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Store.Domain.Entities.Customer;

namespace Store.Infrastructure.Persistence.Configurations;
public class CustomerProfileConfiguration : IEntityTypeConfiguration<CustomerProfile>
{
    public void Configure(EntityTypeBuilder<CustomerProfile> builder)
    {
        builder.Property(c => c.UserId)
            .HasMaxLength(450)
            .IsRequired();

        builder.Property(c => c.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.LastName)
            .HasMaxLength(100)
            .IsRequired();

        builder.OwnsOne(c => c.Email, email =>
        {
            email.Property(e => e.Value)
                .HasColumnName("Email")
                .HasMaxLength(256)
                .IsRequired();
            email.HasIndex(e => e.Value).IsUnique();
        });

        builder.OwnsOne(c => c.Phone, phone =>
        {
            phone.Property(p => p.Value)
                .HasColumnName("Phone")
                .HasMaxLength(20);
        });

        builder.OwnsOne(c => c.Preferences, prefs =>
        {
            prefs.Property(p => p.MarketingEmails)
                .HasDefaultValue(false);

            prefs.Property(p => p.OrderNotifications)
                .HasDefaultValue(true);

            prefs.Property(p => p.NewsletterSubscribed)
                .HasDefaultValue(false);

            prefs.Property(p => p.PreferredLanguage)
                .HasMaxLength(10)
                .HasDefaultValue("en");

            prefs.Property(p => p.PreferredCurrency)
                .HasMaxLength(3)
                .HasDefaultValue("USD");
        });

        builder.HasMany(c => c.Addresses)
            .WithOne()
            .HasForeignKey(a => a.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(c => c.UserId)
            .IsUnique();

    }
}