using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Store.Application.Products.Models;
using Store.Domain.Common;

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