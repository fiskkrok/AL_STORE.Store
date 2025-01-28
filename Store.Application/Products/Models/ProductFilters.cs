namespace Store.Application.Products.Models;

public class ProductFilters
{
    public List<CategoryAggregation> Categories { get; set; } = new();
    public PriceRange PriceRange { get; set; } = new();
}