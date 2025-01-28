using Store.Application.Common.Models;

namespace Store.Application.Products.Models;

public class CategoryDto : BaseDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public string? ImageUrl { get; set; }
    public int ProductCount { get; set; }
}