using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Entities.Product;

namespace Store.Infrastructure.Persistence.Configurations;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.Property(v => v.Sku)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(v => v.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.OwnsOne(v => v.Price, priceBuilder =>
        {
            priceBuilder.Property(m => m.Amount)
                .HasColumnName("Price")
                .HasPrecision(18, 2)
                .IsRequired();

            priceBuilder.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.HasIndex(v => v.Sku)
            .IsUnique();

        builder.HasOne<Product>()
            .WithMany(p => p.Variants)
            .HasForeignKey(v => v.ProductId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
    }
}