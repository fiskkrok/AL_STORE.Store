using Store.Application.Common.Models;

namespace Store.Application.Products.Models;

public class ProductVariantDto : BaseDto
{
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public int StockLevel { get; set; }
    public List<ProductVariantAttributeDto> Attributes { get; set; } = new();
}