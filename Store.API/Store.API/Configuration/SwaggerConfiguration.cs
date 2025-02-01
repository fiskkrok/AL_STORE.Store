using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Store.API.Examples;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.Examples;
using System.Reflection;

using Swashbuckle.AspNetCore.Filters;

namespace Store.API.Configuration;

public static class SwaggerConfiguration
{
    /// <summary>
    /// 
    /// </summary>
    /// <param name="services"></param>
    /// <returns></returns>
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        // Register examples from the assembly where ProductListResponseExample is defined
        services.AddSwaggerExamplesFromAssemblyOf<ProductListResponseExample>();

        services.AddSwaggerGen(static c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Store API",
                Version = "v1",
                Description = "Store API for e-commerce operations"
            });

            // Add API Key definition
            c.AddSecurityDefinition("ApiKey store-sync-f67d322c-4128-4e8e-9c03-e5e2416b8d4f", new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.ApiKey,
                Name = "X-API-Key",
                In = ParameterLocation.Header,
                Description = "API Key authentication"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "ApiKey"
                        }
                    },
                    Array.Empty<string>()
                }
            });


            // Include XML comments
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            c.IncludeXmlComments(xmlPath);

            // Example filters and custom schema filters
            c.ExampleFilters();
            c.OperationFilter<ExamplesOperationFilter>();
            c.SchemaFilter<EnumSchemaFilter>();
        });

        return services;
    }
}

internal class ExamplesOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Implementation of the Apply method
    }
}
