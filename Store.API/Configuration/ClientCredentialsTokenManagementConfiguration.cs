namespace Store.API.Configuration;
/// <summary>
/// Configures client credentials token management for an application. It sets up the token endpoint, client ID, client
/// secret, and scopes.
/// </summary>
public static class ClientCredentialsTokenManagementConfiguration
{
    /// <summary>
    /// Configures client credentials token management for an application using the provided service collection.
    /// </summary>
    /// <param name="services">The service collection is used to register services required for token management.</param>
    /// <param name="builder">The web application builder provides access to configuration settings for setting up the client.</param>
    /// <returns>Returns the updated service collection with the token management configuration.</returns>
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