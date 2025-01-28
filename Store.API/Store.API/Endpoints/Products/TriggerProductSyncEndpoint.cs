using FastEndpoints;

using Microsoft.AspNetCore.Authorization;

using Store.Infrastructure.Services;

using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.Swagger.Annotations;

namespace Store.API.Endpoints.Products;

[SwaggerResponse(200, "Sync triggered successfully")]
[SwaggerResponse(401, "Unauthorized")]
public class TriggerProductSyncEndpoint : EndpointWithoutRequest
{
    private readonly ProductSyncService _syncService;

    public TriggerProductSyncEndpoint(ProductSyncService syncService)
    {
        _syncService = syncService;
    }
    [AllowAnonymous]
    public override void Configure()
    {
        Post("/api/admin/products/sync");
        //Roles("Admin");
        Description(d => d
            .WithTags("Admin")
            .Produces(200)
            //.Produces(401)
            .WithName("TriggerProductSync")
            .WithOpenApi());
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        await _syncService.SyncProductsAsync(ct);
        await SendOkAsync(ct);
    }
}