namespace Store.API.Configuration;

public static class ClientCredentialsTokenManagementConfiguration
{
    public static IServiceCollection AddClientCredentialsTokenManagementConfig(this IServiceCollection services,
        WebApplicationBuilder builder)
    {
        services.AddClientCredentialsTokenManagement()
            .AddClient("admin-api", client =>
            {
                client.TokenEndpoint = $"{builder.Configuration["IdentityServer:Authority"]}/connect/token";
                client.ClientId = builder.Configuration["AdminApi:ClientId"];
                client.ClientSecret = builder.Configuration["AdminApi:ClientSecret"];
                client.Scope = "products.read categories.read";
            });
        return services;
    }
}