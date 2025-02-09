using System.Reflection;

using Duende.AccessTokenManagement;

using FastEndpoints;
using FastEndpoints.Swagger;
using FluentValidation;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.StackExchangeRedis;

using Store.API.Configuration;
using Store.API.Middleware;
using Store.API.Validation;
using Store.Application.Configuration;
using Store.Application.Mappings;
using Store.Infrastructure;
using Store.Infrastructure.Configuration;
using Store.Infrastructure.Persistence;
using Store.Infrastructure.Persistence.Seeding;

using ZiggyCreatures.Caching.Fusion;
using ZiggyCreatures.Caching.Fusion.Serialization.SystemTextJson;

var builder = WebApplication.CreateBuilder(args);


var frontendBaseUrl = builder.Configuration.GetSection("Frontend:BaseUrl").Value;
builder.Services.AddScoped<GlobalExceptionHandlingMiddleware>();
builder.Services.AddHttpClient("FrontendClient", client =>
{
    client.BaseAddress = new Uri(frontendBaseUrl!);
});

builder.Services.AddClientCredentialsTokenManagement()
    .AddClient("admin-api", client =>
    {
        client.TokenEndpoint = $"{builder.Configuration["IdentityServer:Authority"]}/connect/token";
        client.ClientId = builder.Configuration["AdminApi:ClientId"];
        client.ClientSecret = builder.Configuration["AdminApi:ClientSecret"];
        client.Scope = "products.read categories.read";
    });
builder.Services.AddValidatorsFromAssemblyContaining<CreateProfileValidator>();

builder.Services.AddFastEndpoints(options =>
    {
        options.IncludeAbstractValidators = true;
    }).SwaggerDocument()
    .AddOpenApi();
// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>  // Note: AddDefaultPolicy instead of AddPolicy
    {
        builder
            .WithOrigins("http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithExposedHeaders("Content-Disposition"); // Add if you need to expose headers
    });
});
builder.Services.AddSwaggerDocumentation();
builder.Services.AddFusionCache().WithDefaultEntryOptions(options => options.Duration = TimeSpan.FromMinutes(5))
    .WithSerializer(new FusionCacheSystemTextJsonSerializer())
    .WithDistributedCache(
        new RedisCache(new RedisCacheOptions { Configuration = "localhost:6379" }))
    .AsHybridCache();

builder.Services.AddResponseCompression();

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration)
    .AddProductServices(builder.Configuration)
    .AddAuth(builder.Configuration)
    .AddRealTimeServices(builder.Configuration)
    .AddBackgroundJobs().AddKlarnaService(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<IStoreSeeder>();
    await seeder.SeedAsync();
 
}
// Add logging middleware
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>(); // Added
    logger.LogInformation("Handling request: {Method} {Path}", context.Request.Method, context.Request.Path); // Added
    await next.Invoke();
    logger.LogInformation("Finished handling request."); // Added
});

app.UseCors();
app.UseRouting();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
app.UseResponseCompression();
app.UseFastEndpoints().UseSwaggerGen();
app.UseHttpsRedirection();

app.UseRealTimeServices();
await app.RunAsync();

public partial class Program { }