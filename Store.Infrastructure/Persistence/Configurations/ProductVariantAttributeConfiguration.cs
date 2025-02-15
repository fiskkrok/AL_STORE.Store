using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Entities.Product;

namespace Store.Infrastructure.Persistence.Configurations;

public class ProductVariantAttributeConfiguration : IEntityTypeConfiguration<ProductVariantAttribute>
{
    public void Configure(EntityTypeBuilder<ProductVariantAttribute> builder)
    {
        builder.Property(a => a.Name)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(a => a.Value)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasOne<ProductVariant>()
            .WithMany(v => v.Attributes)
            .HasForeignKey(a => a.VariantId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
    }
}