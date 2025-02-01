using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Store.Application.Common.Interfaces;
using Store.Application.Products.Models;
using Store.Domain.Common;
using Store.Domain.Entities.Product;

namespace Store.Application.Products.Queries;

public record GetProductsQuery : IRequest<Result<ProductListResponse>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Search { get; init; }
    public List<Guid>? Categories { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public List<string>? Sizes { get; init; }
    public bool? InStock { get; init; }
    public string? SortBy { get; init; }
}
public class GetProductsQueryHandler(
    IStoreDbContext context,
    ICacheService cache,
    IMapper mapper)
    : IRequestHandler<GetProductsQuery, Result<ProductListResponse>>
{
    public async Task<Result<ProductListResponse>> Handle(
        GetProductsQuery request,
        CancellationToken cancellationToken)
    {
        //var cacheKey = $"products:list:{request.GetHashCode()}";
        //var cached = await cache.GetAsync<ProductListResponse>(cacheKey);
        //if (cached != null || cached?.Items.Count > 10)
        //    return Result<ProductListResponse>.Success(cached);

        //var query = context.Set<Product>()
        //    .AsNoTracking()
        //    .Include(p => p.Images)
        //    .Include(p => p.Variants)
        //    .Where(p => p.IsActive);

        //// Apply filters
        //if (!string.IsNullOrEmpty(request.Search))
        //{
        //    query = query.Where(p =>
        //        p.Name.Contains(request.Search) ||
        //        p.Description.Contains(request.Search) ||
        //        p.Sku.Contains(request.Search));
        //}

        //if (request.Categories?.Any() == true)
        //{
        //    query = query.Where(p => request.Categories.Contains(p.CategoryId));
        //}

        //if (request.MinPrice.HasValue)
        //{
        //    query = query.Where(p => p.Price.Amount >= request.MinPrice.Value);
        //}

        //if (request.MaxPrice.HasValue)
        //{
        //    query = query.Where(p => p.Price.Amount <= request.MaxPrice.Value);
        //}

        //if (request.InStock.HasValue && request.InStock.Value)
        //{
        //    query = query.Where(p => p.StockLevel > 0);
        //}

        //// Apply sorting
        //query = request.SortBy?.ToLower() switch
        //{
        //    "price_asc" => query.OrderBy(p => p.Price.Amount),
        //    "price_desc" => query.OrderBy(p => p.Price.Amount),
        //    "newest" => query.OrderByDescending(p => p.Created),
        //    _ => query.OrderBy(p => p.Name) // Default sorting
        //};

        //// Get aggregations for filters
        //var priceRange = await query
        //    .GroupBy(_ => 1)
        //    .Select(g => new
        //    {
        //        MinPrice = g.Min(p => p.Price.Amount),
        //        MaxPrice = g.Max(p => p.Price.Amount)
        //    })
        //    .FirstOrDefaultAsync(cancellationToken);

        //var categoryAggs = await query
        //    .GroupBy(p => p.CategoryId)
        //    .Select(g => new CategoryAggregation
        //    {
        //        CategoryId = g.Key,
        //        Count = g.Count()
        //    })
        //    .ToListAsync(cancellationToken);

        //// Apply pagination
        //var totalItems = await query.CountAsync(cancellationToken);
        //var items = await query
        //    .Skip((request.Page - 1) * request.PageSize)
        //    .Take(request.PageSize)
        //    .ToListAsync(cancellationToken);

        //var response = new ProductListResponse
        //{
        //    Items = mapper.Map<List<ProductDto>>(items),
        //    Total = totalItems,
        //    Page = request.Page,
        //    PageSize = request.PageSize,
        //    Filters = new ProductFilters
        //    {
        //        Categories = categoryAggs,
        //        PriceRange = new PriceRange
        //        {
        //            Min = priceRange?.MinPrice ?? 0,
        //            Max = priceRange?.MaxPrice ?? 0
        //        }
        //    }
        //};

        //await cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(5));
        var req = await context.Set<Product>().ToListAsync(cancellationToken: cancellationToken);
        var response = new ProductListResponse
        {
            Items = mapper.Map<List<ProductDto>>(req),
            Total = req.Count
        };
        return Result<ProductListResponse>.Success(response);
    }
}