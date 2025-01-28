using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Store.Domain.Common;

namespace Store.Domain.Entities.Product;
public class ProductVariantAttribute : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Value { get; private set; } = string.Empty;
    public Guid VariantId { get; private set; }

    private ProductVariantAttribute() { }

    public ProductVariantAttribute(string name, string value, Guid variantId)
    {
        Name = name;
        Value = value;
        VariantId = variantId;
    }
}