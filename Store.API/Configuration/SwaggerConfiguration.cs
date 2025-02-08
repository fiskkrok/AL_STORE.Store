using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;

using Swashbuckle.AspNetCore.Filters;

namespace Store.API.Configuration;

public static class SwaggerConfiguration
{
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Store API",
                Version = "v1",
                Description = "Store API for e-commerce operations",
                Contact = new OpenApiContact
                {
                    Name = "Your Name",
                    Email = "your.email@example.com",
                    Url = new Uri("https://yourwebsite.com")
                },
                License = new OpenApiLicense
                {
                    Name = "Use under License",
                    Url = new Uri("https://example.com/license")
                }
            });

            // Add API Key definition
            c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
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

            c.CustomSchemaIds(type =>
            {
                var name = type.Name;
                if (type.IsGenericType)
                {
                    var genericArgs = string.Join("", type.GetGenericArguments().Select(t => t.Name));
                    name = $"{type.Name.Split('`')[0]}{genericArgs}";
                }
                return name;
            });
            // Include XML comments
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                c.IncludeXmlComments(xmlPath);
            }

        });

        return services;
    }
}


