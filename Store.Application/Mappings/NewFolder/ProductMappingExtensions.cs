using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;
using Store.Application.Products.Models;
using Store.Domain.Entities.Product;
using Store.Domain.ValueObjects;

namespace Store.Application.Mappings.Products;
public static class ProductMappingExtensions
{
    public static IMappingExpression<AdminProductDto, Product> ConfigureProductMapping(
        this IMappingExpression<AdminProductDto, Product> mapping)
    {
        return mapping
            .ForMember(d => d.StockLevel, o => o.MapFrom(s => s.Stock))
            .ForMember(d => d.Price, o => o.MapFrom(s =>
                Money.FromDecimal(s.Price, s.Currency)))
            .ForMember(d => d.CompareAtPrice, o => o.MapFrom(s =>
                s.CompareAtPrice.HasValue ?
                    Money.FromDecimal(s.CompareAtPrice.Value, s.Currency) : null))
            .ForMember(d => d.Images, o => o.Ignore())
            .ForMember(d => d.Variants, o => o.Ignore())
            .AfterMap((src, dest) => MapProductCollections(src, dest));
    }

    private static void MapProductCollections(AdminProductDto src, Product dest)
    {
        // Map Images with null safety
        var images = src.Images?
            .Where(i => !string.IsNullOrEmpty(i.Url))
            .Select(i => new ProductImage(
                i.Url,
                i.AltText ?? string.Empty,
                i.IsPrimary,
                i.DisplayOrder,
                dest.Id))
            .ToList() ?? new List<ProductImage>();

        dest.UpdateImages(images);
        if (src.CompareAtPrice.HasValue)
        {
            dest.CompareAtPrice = Money.FromDecimal(
                src.CompareAtPrice.Value,
                src.CompareAtPriceCurrency ?? src.Currency // Fallback to main currency if not specified
            );
        }
        // Map Variants with null safety
        var variants = src.Variants?
            .Where(v => !string.IsNullOrEmpty(v.Sku))
            .Select(v => new ProductVariant(
                v.Sku,
                v.Name ?? "Unknown Variant",
                Money.FromDecimal(v.Price, v.Currency),
                v.StockLevel,
                dest.Id))
            .ToList() ?? new List<ProductVariant>();

        dest.UpdateVariants(variants);
    }
}
