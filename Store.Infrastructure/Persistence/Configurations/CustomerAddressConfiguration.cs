using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Store.Domain.Entities.Customer;

namespace Store.Infrastructure.Persistence.Configurations;

public class CustomerAddressConfiguration : IEntityTypeConfiguration<CustomerAddress>
{
    public void Configure(EntityTypeBuilder<CustomerAddress> builder)
    {
        builder.Property(a => a.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.LastName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.Street)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(a => a.StreetNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(a => a.Apartment)
            .HasMaxLength(20);

        builder.Property(a => a.PostalCode)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(a => a.City)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.State)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.Country)
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(a => a.Phone)
            .HasMaxLength(20);

        builder.HasIndex(a => new { a.CustomerId, a.Type, a.IsDefault });
    }
}