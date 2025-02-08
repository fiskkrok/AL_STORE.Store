using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Store.Domain.Entities.Order;

namespace Store.Infrastructure.Persistence.Configurations;

public class PaymentSessionConfiguration : IEntityTypeConfiguration<PaymentSession>
{
    public void Configure(EntityTypeBuilder<PaymentSession> builder)
    {
        builder.Property(ps => ps.ClientToken)
            .HasColumnType("VARCHAR(MAX)")
            .IsRequired();

        builder.Property(ps => ps.PaymentMethod)
            .HasMaxLength(50)
            .IsRequired();

        // Configure Amount as owned entity with table splitting
        builder.OwnsOne(ps => ps.Amount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("Amount")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.HasIndex(ps => ps.OrderId);
        builder.HasIndex(ps => ps.Status);
        builder.HasIndex(ps => ps.ExpiresAt);
    }
}