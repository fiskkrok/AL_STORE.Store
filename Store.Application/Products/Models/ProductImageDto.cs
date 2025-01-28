using Store.Application.Common.Models;

namespace Store.Application.Products.Models;

public class ProductImageDto : BaseDto
{
    public string Url { get; set; } = string.Empty;
    public string AltText { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
}