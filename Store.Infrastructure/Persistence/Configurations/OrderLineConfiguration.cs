using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Entities.Order;

namespace Store.Infrastructure.Persistence.Configurations;

public class OrderLineConfiguration : IEntityTypeConfiguration<OrderLine>
{
    public void Configure(EntityTypeBuilder<OrderLine> builder)
    {
        builder.Property(ol => ol.ProductName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(ol => ol.Sku)
            .HasMaxLength(50);

        builder.OwnsOne(ol => ol.UnitPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(ol => ol.LineTotal, money =>
        {
            money.Property(m => m.Amount)
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasMaxLength(3)
                .IsRequired();
        });
    }
}