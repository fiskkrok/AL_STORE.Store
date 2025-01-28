using Store.Application.Products.Models;

namespace Store.Application.Mappings;

public class ProductListResponse
{
    public List<ProductDto> Items { get; init; } = new();
    public int Total { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public ProductFilters Filters { get; init; } = new();
}