using FastEndpoints;
using FastEndpoints.Swagger;

using Store.API.Configuration;
using Store.API.Middleware;
using Store.Application.Configuration;
using Store.Infrastructure.Configuration;
using Store.Infrastructure.Persistence;
using Store.Infrastructure.Persistence.Seeding;


var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddApiServices(builder.Configuration);
builder.Services.AddApplication();
builder.AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    // Seed data in development
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<IStoreSeeder>();
    await seeder.SeedAsync();
}

app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

    logger.LogInformation(
        "Request {Method} {Path}",
        context.Request.Method,
        context.Request.Path
    );

    //logger.LogInformation(
    //    "Request {Method} {Path} - Auth: {IsAuthenticated}, User: {User}",
    //    context.Request.Method,
    //    context.Request.Path,
    //    context.User?.Identity?.IsAuthenticated,
    //    context.User?.Identity?.Name
    //);

    if (context.User?.Identity?.IsAuthenticated == true)
    {
        var claims = context.User.Claims.Select(c => new { c.Type, c.Value });
        logger.LogInformation("Claims: {@Claims}", claims);
    }

    await next();
});

app.UseRouting();
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseFastEndpoints(o => { o.Endpoints.RoutePrefix = "api"; });
app.UseSwaggerGen();
app.UseResponseCompression();
app.MapSignalRHubs();
app.UseRealTimeServices();

await app.RunAsync();


/// <summary>
/// </summary>
#pragma warning disable S1118 // Utility classes should not have public constructors
public partial class Program
{
}
#pragma warning restore S1118 // Utility classes should not have public constructors