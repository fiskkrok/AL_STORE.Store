using FastEndpoints;

using MediatR;

using Store.API.Examples;
using Store.Application.Products.Models;
using Store.Application.Products.Queries;

using Swashbuckle.AspNetCore.Filters;
using Swashbuckle.Swagger.Annotations;

namespace Store.API.Endpoints.Products;

public class GetStoreProductsRequest
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Search { get; init; }
    public List<Guid>? Categories { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public bool? InStock { get; init; }
    public string? SortBy { get; init; }
}

// Store products listing endpoint
[SwaggerResponse(200, "Successful response", typeof(ProductListResponse))]
[SwaggerResponseExample(200, typeof(ProductListResponseExample))]
[SwaggerResponse(400, "Bad request")]
public class GetStoreProductsEndpoint : Endpoint<GetStoreProductsRequest, ProductListResponse>
{
    private readonly IMediator _mediator;

    public GetStoreProductsEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Get("/api/store/products");
        AllowAnonymous();
        Description(d => d
            .WithTags("Store")
            .Produces<ProductListResponse>(200)
            .ProducesProblem(400)
            .WithName("GetStoreProducts")
            .WithOpenApi());
    }

    public override async Task HandleAsync(GetStoreProductsRequest req, CancellationToken ct)
    {
        var query = new GetProductsQuery
        {
            Page = req.Page,
            PageSize = req.PageSize,
            Search = req.Search,
            Categories = req.Categories,
            MinPrice = req.MinPrice,
            MaxPrice = req.MaxPrice,
            InStock = req.InStock,
            SortBy = req.SortBy
        };

        var result = await _mediator.Send(query, ct);

        if (result.IsSuccess)
            await SendOkAsync(result.Value, ct);
        else
            await SendErrorsAsync(400, ct);
    }
}
