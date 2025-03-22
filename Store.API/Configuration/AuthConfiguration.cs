using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Store.Infrastructure.Configuration;

namespace Store.API.Configuration;

/// <summary>
/// </summary>
public static class AuthConfiguration
{
    /// <summary>
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    /// <returns></returns>
    public static IServiceCollection AddAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.Authority = "https://dev-3on2otf3kmyxv53z.us.auth0.com/";
                options.Audience = "https://localhost:7002";
                options.RefreshOnIssuerKeyNotFound = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    IgnoreTrailingSlashWhenValidatingAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    RoleClaimType = "permissions", // Auth0 uses 'permissions' for roles
                    NameClaimType = ClaimTypes.NameIdentifier // Map to standard claim type
                };
                // For debugging
                //options.Events = new JwtBearerEvents
                //{
                //    OnAuthenticationFailed = context =>
                //    {
                //        var logger =
                //            context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>(); // Added
                //        logger.LogError(context.Exception, "Authentication failed"); // Modified
                //        return Task.CompletedTask;
                //    },
                //    OnTokenValidated = context =>
                //    {
                //        var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();

                //        if (context.Principal?.Identity is ClaimsIdentity identity)
                //        {
                //            // Ensure we have the nameidentifier claim
                //            var subjectId = identity.FindFirst(ClaimTypes.NameIdentifier)?.Value
                //                            ?? identity.FindFirst("sub")?.Value;

                //            if (subjectId != null && !identity.HasClaim(c => c.Type == ClaimTypes.NameIdentifier))
                //                identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, subjectId));
                //        }

                //        logger.LogInformation("Token validated. Claims: {@Claims}",
                //            context.Principal?.Claims.Select(c => new { c.Type, c.Value }));

                //        return Task.CompletedTask;
                //    },
                //    OnChallenge =
                //        context => // Enhanced logging for authorization challenge (REVISED - Removed AuthenticateResult)
                //        {
                //            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                //            logger.LogWarning(
                //                "JwtBearerEvents - OnChallenge: {Error}, {ErrorDescription}, Scheme: {Scheme}",
                //                context.Error, context.ErrorDescription,
                //                context.Scheme.Name); // Removed AuthenticateResult
                //            return Task.CompletedTask;
                //        },
                //    OnMessageReceived = context =>
                //    {
                //        var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                //        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault(); // Modified logging
                //        logger.LogInformation("Authorization Header in OnMessageReceived: {AuthHeader}",
                //            authHeader); // Modified logging
                //        return Task.CompletedTask;
                //    }
                //};
            })
            .AddScheme<AuthenticationSchemeOptions, ApiKeyAuthenticationHandler>("ApiKey", _ => { });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("RequireAuth", policy =>
                policy.RequireAuthenticatedUser());

            // Or if you want to check specific claims
            options.AddPolicy("RequireProfile", policy =>
                policy.RequireClaim("permissions", "read:profile"));

            options.AddPolicy("RequireApiKey", policy =>
                policy.AddAuthenticationSchemes("ApiKey")
                    .RequireAuthenticatedUser());
        });

        return services;
    }
}