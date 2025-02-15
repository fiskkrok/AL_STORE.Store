using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Store.Domain.Entities.Product;

namespace Store.Infrastructure.Persistence.Seeding;

public interface ICategorySeeder
{
    Task SeedAsync();
}

public class CategorySeeder : ICategorySeeder
{
    private readonly StoreDbContext _context;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<CategorySeeder> _logger;

    public CategorySeeder(
        StoreDbContext context,
        IWebHostEnvironment env,
        ILogger<CategorySeeder> logger)
    {
        _context = context;
        _env = env;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            if (!_context.Categories.Any())
            {
                _logger.LogInformation("Starting category seeding...");

                var sourcePath = Path.Combine(_env.ContentRootPath, "Setup", "categories.json");
                var sourceJson = await File.ReadAllTextAsync(sourcePath);
                var seedData = JsonSerializer.Deserialize<CategorySeedData>(sourceJson,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });

                if (seedData?.Categories == null)
                {
                    _logger.LogWarning("No categories found in seed data");
                    return;
                }

                // Create root categories first
                foreach (var categoryData in seedData.Categories) await CreateCategoryHierarchy(categoryData, null);

                await _context.SaveChangesAsync();
                _logger.LogInformation("Categories seeded successfully");
            }
            else
            {
                _logger.LogInformation("Categories already exist - skipping seed");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding categories");
            throw;
        }
    }

    private async Task CreateCategoryHierarchy(CategoryData data, Guid? parentId)
    {
        var category = new Category(
            data.Name,
            data.Slug,
            data.Description,
            data.ImageUrl,
            parentId);

        // Set the ID to match admin system
        typeof(Category)
            .GetProperty(nameof(Category.Id))
            ?.SetValue(category, Guid.Parse(data.Id));

        // Set additional properties if needed
        _context.Entry(category).Property("Created").CurrentValue = data.CreatedAt;
        _context.Entry(category).Property("CreatedBy").CurrentValue = data.CreatedBy;

        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();

        // Process subcategories
        if (data.SubCategories != null)
            foreach (var subCategoryData in data.SubCategories)
                await CreateCategoryHierarchy(subCategoryData, category.Id);
    }
}

public class CategorySeedData
{
    public List<CategoryData> Categories { get; set; } = new();
}

public class CategoryData
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public bool IsActive { get; set; } = true;
    public List<CategoryData>? SubCategories { get; set; }
}