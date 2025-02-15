using Store.Domain.Common;

namespace Store.Domain.Entities.Product;

public class ProductVariantAttribute : BaseEntity
{
    private ProductVariantAttribute()
    {
    }

    public ProductVariantAttribute(string name, string value, Guid variantId)
    {
        Name = name;
        Value = value;
        VariantId = variantId;
    }

    public string Name { get; private set; } = string.Empty;
    public string Value { get; private set; } = string.Empty;
    public Guid VariantId { get; private set; }
}