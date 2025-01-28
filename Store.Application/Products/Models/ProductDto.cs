using Store.Application.Common.Models;
using Store.Domain.Entities.Product;

namespace Store.Application.Products.Models;

public class ProductDto : BaseDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public int StockLevel { get; set; }
    public bool IsActive { get; set; }
    public Guid CategoryId { get; set; }
    public IEnumerable<ProductImageDto> Images { get; set; }
    public ProductImageDto? PrimaryImage => Images.FirstOrDefault(x => x.IsPrimary);
    public IEnumerable<ProductVariant> Variants { get; set; }
}