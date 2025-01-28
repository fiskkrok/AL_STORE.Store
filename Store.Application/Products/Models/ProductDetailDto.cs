namespace Store.Application.Products.Models;

public class ProductDetailDto : ProductDto
{
    public List<ProductVariantDto> Variants { get; set; } = new();
    public Dictionary<string, string> Attributes { get; set; } = new();
    public List<ProductDto> RelatedProducts { get; set; } = new();
}