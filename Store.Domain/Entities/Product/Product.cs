using Store.Domain.Common;
using Store.Domain.Events.Product;
using Store.Domain.Exceptions;
using Store.Domain.ValueObjects;

namespace Store.Domain.Entities.Product;

public class Product : BaseAuditableEntity
{
    private Product() { }
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string? ShortDescription { get; private set; } // New
    public string Sku { get; private set; } = string.Empty;
    public string? Barcode { get; private set; } // New
    public Money Price { get; private set; } = Money.Zero();
    public Money? CompareAtPrice { get; set; } // New
    public int StockLevel { get; private set; }
    public int? LowStockThreshold { get; private set; } // New
    public bool IsActive { get; private set; }
    public Guid CategoryId { get; private set; }
    public List<string> Tags { get; private set; } = new(); // New

    private readonly List<ProductImage> _images = new();
    public IReadOnlyCollection<ProductImage> Images => _images.AsReadOnly();

    private readonly List<ProductVariant> _variants = new();
    public IReadOnlyCollection<ProductVariant> Variants => _variants.AsReadOnly();


    public Product(
        string name,
        string slug,
        string description,
        string? shortDescription,
        string sku,
        Money price,
        Money? compareAtPrice,
        int stockLevel,
        int? lowStockThreshold,
        Guid categoryId)
    {
        Name = name;
        Slug = slug;
        Description = description;
        ShortDescription = shortDescription;
        Sku = sku;
        Price = price;
        CompareAtPrice = compareAtPrice;
        StockLevel = stockLevel;
        LowStockThreshold = lowStockThreshold;
        CategoryId = categoryId;
        IsActive = true;
    }

    public void Update(
        string name,
        string description,
        string? shortDescription,
        Money price,
        Money? compareAtPrice,
        int stockLevel,
        int? lowStockThreshold,
        Guid categoryId)
    {
        Name = name;
        Description = description;
        ShortDescription = shortDescription;
        Price = price;
        CompareAtPrice = compareAtPrice;
        StockLevel = stockLevel;
        LowStockThreshold = lowStockThreshold;
        CategoryId = categoryId;

        AddDomainEvent(new ProductUpdatedEvent(this));
    }

    public void UpdateStock(int newStockLevel)
    {
        if (newStockLevel < 0)
            throw new DomainException("Stock level cannot be negative");

        StockLevel = newStockLevel;
        AddDomainEvent(new StockUpdatedEvent(Id, newStockLevel, newStockLevel < 10));
    }

    public void UpdateImages(IEnumerable<ProductImage> images)
    {
        _images.Clear();
        _images.AddRange(images);
    }

    //public void UpdateVariants(IEnumerable<ProductVariant> variants)
    //{
    //    _variants.Clear();
    //    _variants.AddRange(variants);
    //}
    public void UpdateVariants(IEnumerable<ProductVariant> variants)
    {
        // Remove variants that no longer exist
        var variantIds = variants.Select(v => v.Id).ToList();
        var removedVariants = _variants.Where(v => !variantIds.Contains(v.Id)).ToList();
        foreach (var variant in removedVariants)
        {
            _variants.Remove(variant);
        }

        // Update or add variants
        foreach (var variant in variants)
        {
            var existingVariant = _variants.FirstOrDefault(v => v.Id == variant.Id);
            if (existingVariant != null)
            {
                existingVariant.Update(
                    variant.Sku,
                    variant.Name,
                    variant.Price,
                    variant.StockLevel);
            }
            else
            {
                _variants.Add(variant);
            }
        }

        AddDomainEvent(new ProductVariantsUpdatedEvent(this.Id, variantIds));
    }
}

public class ProductUpdatedEvent : BaseDomainEvent
{
    public ProductUpdatedEvent(Product product)
    {
        throw new NotImplementedException();
    }
}

public class StockUpdatedEvent : BaseDomainEvent
{
    public StockUpdatedEvent(Guid id, int newStockLevel, bool b)
    {
        throw new NotImplementedException();
    }
}