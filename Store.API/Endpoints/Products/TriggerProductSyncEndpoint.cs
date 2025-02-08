using FastEndpoints;

using Microsoft.AspNetCore.Authorization;

using Store.Infrastructure.Services;

using Swashbuckle.AspNetCore.Annotations;

namespace Store.API.Endpoints.Products;

/// <inheritdoc />
public class TriggerProductSyncEndpoint : EndpointWithoutRequest
{
    private readonly ProductSyncService _syncService;

    /// <inheritdoc />
    public TriggerProductSyncEndpoint(ProductSyncService syncService)
    {
        _syncService = syncService;
    }

    /// <summary>
    /// 
    /// </summary>
    [AllowAnonymous]
    public override void Configure()
    {
        Post("/api/admin/products/sync");
        AllowAnonymous(Http.POST);
        AuthSchemes("ApiKey"); // Be explicit about the scheme
        Description(d => d
            .WithTags("Admin")
            .Produces(200)
            .Produces(401)
            .WithName("TriggerProductSync")
            .WithOpenApi());
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param CancellationToken="ct"></param>
    public override async Task HandleAsync(CancellationToken ct)
    {
        await _syncService.SyncProductsAsync(ct);
        await SendOkAsync(ct);
    }
}