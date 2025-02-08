using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Store.Domain.Entities.Customer;

namespace Store.Infrastructure.Persistence.Configurations;
public class CustomerAddressConfiguration : IEntityTypeConfiguration<CustomerAddress>
{
    public void Configure(EntityTypeBuilder<CustomerAddress> builder)
    {
        builder.OwnsOne(a => a.Address, address =>
        {
            address.Property(a => a.Street)
                .HasMaxLength(200)
                .IsRequired();

            address.Property(a => a.City)
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.State)
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.Country)
                .HasMaxLength(2)
                .IsRequired();

            address.Property(a => a.PostalCode)
                .HasMaxLength(20)
                .IsRequired();
        });

        builder.HasIndex(a => new { a.CustomerId, a.Type, a.IsDefault });
    }
}
