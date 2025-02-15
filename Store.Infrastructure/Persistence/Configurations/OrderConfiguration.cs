using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Entities.Order;

namespace Store.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.Property(o => o.OrderNumber)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(o => o.CustomerId)
            .HasMaxLength(450); // Matches ASP.NET Identity user ID length

        builder.Property(o => o.KlarnaOrderReference)
            .HasMaxLength(100);

        // Configure TotalAmount as owned entity with table splitting
        builder.OwnsOne(o => o.TotalAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("TotalAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3)
                .IsRequired();
        });

        // Configure BillingAddress as owned entity
        builder.OwnsOne(o => o.BillingAddress, address =>
        {
            address.Property(a => a.Street)
                .HasColumnName("BillingStreet")
                .HasMaxLength(200)
                .IsRequired();

            address.Property(a => a.City)
                .HasColumnName("BillingCity")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.State)
                .HasColumnName("BillingState")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.Country)
                .HasColumnName("BillingCountry")
                .HasMaxLength(2)
                .IsRequired();

            address.Property(a => a.PostalCode)
                .HasColumnName("BillingPostalCode")
                .HasMaxLength(20)
                .IsRequired();
        });

        // Configure ShippingAddress as owned entity
        builder.OwnsOne(o => o.ShippingAddress, address =>
        {
            address.Property(a => a.Street)
                .HasColumnName("ShippingStreet")
                .HasMaxLength(200)
                .IsRequired();

            address.Property(a => a.City)
                .HasColumnName("ShippingCity")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.State)
                .HasColumnName("ShippingState")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.Country)
                .HasColumnName("ShippingCountry")
                .HasMaxLength(2)
                .IsRequired();

            address.Property(a => a.PostalCode)
                .HasColumnName("ShippingPostalCode")
                .HasMaxLength(20)
                .IsRequired();
        });

        // Configure OrderLines
        builder.HasMany(o => o.OrderLines)
            .WithOne()
            .HasForeignKey(ol => ol.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure PaymentAttempts
        builder.HasMany(o => o.PaymentAttempts)
            .WithOne()
            .HasForeignKey(pa => pa.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Add useful indexes
        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.HasIndex(o => o.CustomerId);
        builder.HasIndex(o => o.Status);
    }
}