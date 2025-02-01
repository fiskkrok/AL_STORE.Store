using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using Store.Infrastructure.Persistence;

namespace Store.Infrastructure.Persistence.Seeding;

public interface IStoreSeeder
{
    Task SeedAsync();
}

public class StoreSeeder : IStoreSeeder
{
    private readonly StoreDbContext _context;
    private readonly ICategorySeeder _categorySeeder;
    private readonly ILogger<StoreSeeder> _logger;

    public StoreSeeder(
        StoreDbContext context,
        ICategorySeeder categorySeeder,
        ILogger<StoreSeeder> logger)
    {
        _context = context;
        _categorySeeder = categorySeeder;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            await _context.Database.MigrateAsync();

            _logger.LogInformation("Starting database seeding...");
            await _categorySeeder.SeedAsync();
            _logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database");
            throw;
        }
    }
}