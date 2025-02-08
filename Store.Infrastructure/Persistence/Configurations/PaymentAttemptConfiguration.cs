using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Entities.Order;

namespace Store.Infrastructure.Persistence.Configurations;

public class PaymentAttemptConfiguration : IEntityTypeConfiguration<PaymentAttempt>
{
    public void Configure(EntityTypeBuilder<PaymentAttempt> builder)
    {
        builder.Property(pa => pa.ErrorMessage)
            .HasMaxLength(500);

        builder.HasIndex(pa => new { pa.OrderId, pa.PaymentSessionId });
        builder.HasIndex(pa => pa.Status);
    }
}