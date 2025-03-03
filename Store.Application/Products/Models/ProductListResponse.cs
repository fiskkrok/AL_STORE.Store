﻿namespace Store.Application.Products.Models;

public class ProductListResponse
{
    public List<ProductDto> Items { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public ProductFilters Filters { get; set; } = new();
}