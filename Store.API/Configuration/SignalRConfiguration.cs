using Store.API.Hubs;

namespace Store.API.Configuration;

/// <summary>
/// Provides extension methods for configuring SignalR hubs.
/// </summary>
public static class SignalRConfiguration
{
    /// <summary>
    /// Maps the SignalR hubs to the specified endpoint route builder.
    /// </summary>
    /// <param name="endpoints">The endpoint route builder to add the hubs to.</param>
    /// <returns>The endpoint route builder with the mapped hubs.</returns>
    public static IEndpointRouteBuilder MapSignalRHubs(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHub<StoreHub>("/storehub");
        return endpoints;
    }
}