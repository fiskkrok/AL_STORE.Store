using System.Security.Claims;
using FastEndpoints;

namespace Store.API.Endpoints.Customers.Profile;
// Or your correct namespace

public class AuthTestEndpoint : EndpointWithoutRequest
{
    private readonly ILogger<AuthTestEndpoint> _logger;

    public AuthTestEndpoint(ILogger<AuthTestEndpoint> logger)
    {
        _logger = logger;
    }

    public override void Configure()
    {
        Get("/auth/test");
        Policies("RequireAuth"); // Use policy instead of Claims
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        // Log all claims for debugging
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        _logger.LogInformation("Current user claims: {@Claims}", claims);

        // Check if user is authenticated
        if (!User.Identity?.IsAuthenticated ?? false)
        {
            await SendUnauthorizedAsync(ct);
            return;
        }

        // Get the subject ID either from nameidentifier or sub claim
        var subjectId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;

        _logger.LogInformation("Subject ID: {SubjectId}", subjectId);

        if (string.IsNullOrEmpty(subjectId))
        {
            _logger.LogWarning("No subject ID found in claims");
            await SendForbiddenAsync(ct);
            return;
        }

        await SendOkAsync(ct);
    }
}