using FastEndpoints;
using MediatR;
using Store.Application.Products.Models;
using Store.Application.Products.Queries;

namespace Store.API.Endpoints.Products;
/// <summary>
/// 
/// </summary>
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
/// <summary>
/// </summary>
public class GetStoreProductsEndpoint : EndpointWithoutRequest<ProductListResponse>
{
    private readonly ILogger<GetStoreProductsEndpoint> _logger;
    private readonly IMediator _mediator;
    /// <summary>
    /// 
    /// </summary>
    public GetStoreProductsEndpoint(IMediator mediator, ILogger<GetStoreProductsEndpoint> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }
    /// <summary>
    /// 
    /// </summary>
    public override void Configure()
    {
        Get("/store/products"); // Consistent route
        AllowAnonymous(); // Add this if the endpoint should be public
        Description(d => d
            .WithTags("Store")
            .Produces<ProductListResponse>()
            .ProducesProblem(400)
            .WithName("GetStoreProducts")
            .WithOpenApi());

        // Specify that parameters come from query
        Summary(s =>
        {
            s.Summary = "Get store products with filtering";
            s.Description = "Retrieves a paginated list of products with optional filtering";
        });
    }
    /// <summary>
    /// 
    /// </summary>
    public override async Task HandleAsync(CancellationToken ct)
    {
        var query = new GetProductsQuery();
        //GetProductsQuery query = new GetProductsQuery
        //{
        //    Page = req.Page,
        //    PageSize = req.PageSize,
        //    Search = req.Search,
        //    Categories = req.Categories,
        //    MinPrice = req.MinPrice,
        //    MaxPrice = req.MaxPrice,
        //    InStock = req.InStock,
        //    SortBy = req.SortBy
        //};
        _logger.LogInformation("\e Hit the GetProducts endpoint with query: {Query} \e", query);
        var result = await _mediator.Send(query, ct);

        if (!result.IsSuccess)
        {
            _logger.LogInformation("Something went wrong getting the products {Error}", result.Errors);
            await SendErrorsAsync(400, ct);
        }
        else
        {
            _logger.LogInformation("Successfully got the products");
            await SendOkAsync(result.Value!, ct);
        }
    }
}