using FastEndpoints;
using FastEndpoints.Swagger;
using FluentValidation;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Store.API.Configuration;
using Store.API.Middleware;
using Store.API.Validation;
using Store.Application.Configuration;
using Store.Infrastructure.Configuration;
using Store.Infrastructure.Persistence.Seeding;
using ZiggyCreatures.Caching.Fusion;
using ZiggyCreatures.Caching.Fusion.Serialization.SystemTextJson;
// Added

var builder = WebApplication.CreateBuilder(args);


var frontendBaseUrl = builder.Configuration.GetSection("Frontend:BaseUrl").Value;
builder.Services.AddScoped<GlobalExceptionHandlingMiddleware>();
builder.Services.AddHttpClient("FrontendClient", client => { client.BaseAddress = new Uri(frontendBaseUrl!); });

builder.Services.AddClientCredentialsTokenManagementConfig(builder);
builder.Services.AddValidatorsFromAssemblyContaining<CreateProfileValidator>();

// Configure CORS
builder.Services.AddCorsConfig();

builder.Services.AddSwaggerDocumentation();
builder.Services.AddFusionCache().WithDefaultEntryOptions(options => options.Duration = TimeSpan.FromMinutes(5))
    .WithSerializer(new FusionCacheSystemTextJsonSerializer())
    .WithDistributedCache(
        new RedisCache(new RedisCacheOptions { Configuration = "localhost:6379" }))
    .AsHybridCache();

builder.Services.AddResponseCompression();

builder.Services.AddAuth(builder.Configuration);
builder.Services.AddBackgroundJobs().AddKlarnaService(builder.Configuration);
builder.Services.AddFastEndpoints(options => { options.IncludeAbstractValidators = true; }).SwaggerDocument()
    .AddOpenApi();
builder.Services.AddRealTimeServices(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddProductServices(builder.Configuration);
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<IStoreSeeder>();
    await seeder.SeedAsync();
}

app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

    logger.LogInformation(
        "Request {Method} {Path} - Auth: {IsAuthenticated}, User: {User}",
        context.Request.Method,
        context.Request.Path,
        context.User?.Identity?.IsAuthenticated,
        context.User?.Identity?.Name
    );

    if (context.User?.Identity?.IsAuthenticated == true)
    {
        var claims = context.User.Claims.Select(c => new { c.Type, c.Value });
        logger.LogInformation("Claims: {@Claims}", claims);
    }

    await next();
});
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
app.UseFastEndpoints(o => { o.Endpoints.RoutePrefix = "api"; }).UseSwaggerGen();
app.MapSignalRHubs();
app.UseResponseCompression();
app.UseHttpsRedirection();
app.UseRealTimeServices();
await app.RunAsync();

/// <summary>
/// </summary>
#pragma warning disable S1118 // Utility classes should not have public constructors
public partial class Program
{
}
#pragma warning restore S1118 // Utility classes should not have public constructors