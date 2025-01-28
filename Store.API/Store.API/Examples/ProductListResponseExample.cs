using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Store.Application.Products.Models;

using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.Examples;

namespace Store.API.Examples;


public class ProductListResponseExample : IExamplesProvider
{
    public object GetExamples()
    {
        return new ProductListResponse
        {
            Items = new List<ProductDto>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Name = "Premium Coffee Beans",
                    Slug = "premium-coffee-beans",
                    Description = "Arabica beans from Colombian highlands",
                    Sku = "COF-PRM-001",
                    Price = 24.99m,
                    Currency = "USD",
                    StockLevel = 150,
                    IsActive = true,
                    CategoryId = Guid.NewGuid(),
                    Images = new List<ProductImageDto>
                    {
                        new()
                        {
                            Id = Guid.NewGuid(),
                            Url = "/images/products/coffee-1.jpg",
                            AltText = "Premium Coffee Beans Package",
                            IsPrimary = true,
                            DisplayOrder = 0
                        }
                    }
                }
            },
            Total = 1,
            Page = 1,
            PageSize = 20,
            Filters = new ProductFilters
            {
                Categories = new List<CategoryAggregation>
                {
                    new() { CategoryId = Guid.NewGuid(), Count = 10 }
                },
                PriceRange = new PriceRange { Min = 0, Max = 99.99m }
            }
        };
    }
}

// Enum Schema Filter
public class EnumSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type.IsEnum)
        {
            schema.Enum.Clear();
            Enum.GetNames(context.Type)
                .ToList()
                .ForEach(name => schema.Enum.Add(new OpenApiString(name)));
        }
    }
}
