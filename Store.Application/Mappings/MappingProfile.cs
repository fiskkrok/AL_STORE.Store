using AutoMapper;
using Store.Application.Products.Models;
using Store.Domain.Entities.Product;

namespace Store.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<AdminProductDto, Product>()
            .ConfigureProductMapping();
        CreateMap<Product, ProductDto>()
            .ForMember(d => d.Price, o => o.MapFrom(s => s.Price.Amount))
            .ForMember(d => d.Currency, o => o.MapFrom(s => s.Price.Currency))
            .ForMember(d => d.PrimaryImage, o => o.MapFrom(s =>
                s.Images.FirstOrDefault(i => i.IsPrimary)));

        CreateMap<Product, ProductDetailDto>()
            .IncludeBase<Product, ProductDto>()
            .ForMember(d => d.Attributes, o => o.MapFrom(s =>
                s.Variants.SelectMany(v => v.Attributes)
                    .GroupBy(a => a.Name)
                    .ToDictionary(g => g.Key, g => g.First().Value)));

        CreateMap<ProductImage, ProductImageDto>();

        CreateMap<ProductVariant, ProductVariantDto>()
            .ForMember(d => d.Price, o => o.MapFrom(s => s.Price.Amount))
            .ForMember(d => d.Currency, o => o.MapFrom(s => s.Price.Currency));

        CreateMap<ProductVariantAttribute, ProductVariantAttributeDto>();

        CreateMap<Category, CategoryDto>()
            .ForMember(d => d.ProductCount, o => o.Ignore()); // This is typically loaded separately

        // Sync DTOs
        CreateMap<ProductSyncHistory, SyncHistoryDto>();
    }
}