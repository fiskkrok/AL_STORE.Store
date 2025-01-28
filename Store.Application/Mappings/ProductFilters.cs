using Store.Application.Products.Models;

namespace Store.Application.Mappings;

public class ProductFilters
{
    public List<CategoryAggregation> Categories { get; init; } = new();
    public PriceRange PriceRange { get; init; } = new();
    public List<string> AvailableSizes { get; init; } = new();
}