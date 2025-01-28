using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Store.Domain.Entities.Product;

namespace Store.Infrastructure.Persistence.Configurations;
public class ProductSyncHistoryConfiguration : IEntityTypeConfiguration<ProductSyncHistory>
{
    public void Configure(EntityTypeBuilder<ProductSyncHistory> builder)
    {
        builder.Property(h => h.BatchId)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(h => h.ErrorMessage)
            .HasMaxLength(2000);

        builder.HasIndex(h => h.BatchId)
            .IsUnique();

        builder.HasIndex(h => h.Status);
    }
}
