namespace Store.API.Configuration;

public static class CorsConfiguration
{
    public static IServiceCollection AddCorsConfig(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder
                    .WithOrigins("http://localhost:4200")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .WithExposedHeaders("WWW-Authenticate", "Authorization")
                    .SetIsOriginAllowed(_ => true); // Add this for development
            });
        });
        return services;
    }
}