using Store.API.Hubs;

namespace Store.API.Configuration;

public static class SignalRConfiguration
{
    public static IEndpointRouteBuilder MapSignalRHubs(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHub<StoreHub>("/storehub");
        return endpoints;
    }
}
