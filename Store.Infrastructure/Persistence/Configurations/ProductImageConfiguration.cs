using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Entities.Product;

namespace Store.Infrastructure.Persistence.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.Property(p => p.Url)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(p => p.AltText)
            .HasMaxLength(200);

        builder.HasOne<Product>()
            .WithMany(p => p.Images)
            .HasForeignKey(i => i.ProductId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
    }
}