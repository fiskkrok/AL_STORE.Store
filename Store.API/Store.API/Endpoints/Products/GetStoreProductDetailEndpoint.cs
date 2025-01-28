﻿using FastEndpoints;

using MediatR;

using Store.Application.Products.Models;
using Store.Application.Products.Queries;
using Store.Domain.Entities.Product;

using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.Swagger.Annotations;

namespace Store.API.Endpoints.Products;

[SwaggerResponse(200, "Product detail retrieved", typeof(ProductDetailDto))]
[SwaggerResponse(404, "Product not found")]
public class GetStoreProductDetailEndpoint : Endpoint<GetProductDetailRequest, ProductDetailDto>
{
    private readonly IMediator _mediator;

    public GetStoreProductDetailEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Get("/api/store/products/{Id}");
        AllowAnonymous();
        Description(d => d
            .WithTags("Store")
            .Produces<ProductDetailDto>(200)
            .Produces(404)
            .WithName("GetStoreProductDetail")
            .WithOpenApi());
    }

    public override async Task HandleAsync(GetProductDetailRequest req, CancellationToken ct)
    {
        var query = new GetProductDetailQuery(id: req.Id);
        var result = await _mediator.Send(query, ct);

        await SendOkAsync(result, ct);
    }
}

public record GetProductDetailRequest
{
    public Guid Id { get; init; }
    public string Name { get; init; }
    public string Slug { get; init; }
    public string Description { get; init; }
    public decimal Price { get; init; }
    public string Currency { get; init; }
    public string Sku { get; init; }
    public int StockLevel { get; init; }
    public bool IsActive { get; init; }

    public Guid CategoryId { get; init; }

    public IEnumerable<ProductImageDto> Images { get; init; }
    public ProductImageDto? PrimaryImage => Images.FirstOrDefault(x => x.IsPrimary);
    public IEnumerable<ProductVariant> Variants { get; init; }

}