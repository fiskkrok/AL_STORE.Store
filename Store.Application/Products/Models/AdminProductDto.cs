﻿namespace Store.Application.Products.Models;

public record AdminProductDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? ShortDescription { get; init; }
    public string Sku { get; init; } = string.Empty;
    public string? Barcode { get; init; }
    public decimal Price { get; init; }
    public string Currency { get; init; } = string.Empty;
    public decimal? CompareAtPrice { get; init; } // Added
    public string? CompareAtPriceCurrency { get; init; } // Added
    public int Stock { get; init; }
    public int? LowStockThreshold { get; init; }
    public CategoryDto Category { get; init; } = null!;
    public List<ProductImageDto> Images { get; init; } = new();
    public List<ProductVariantDto> Variants { get; init; } = new();
}