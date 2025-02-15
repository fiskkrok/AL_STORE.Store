using Store.Domain.Common;

namespace Store.Domain.Entities.Product;

public class ProductImage : BaseEntity
{
    private ProductImage()
    {
    }

    public ProductImage(
        string url,
        string altText,
        bool isPrimary,
        int displayOrder,
        Guid productId)
    {
        Url = url;
        AltText = altText;
        IsPrimary = isPrimary;
        DisplayOrder = displayOrder;
        ProductId = productId;
    }

    public string Url { get; private set; }
    public string AltText { get; private set; }
    public bool IsPrimary { get; private set; }
    public int DisplayOrder { get; private set; }
    public Guid ProductId { get; private set; }
}