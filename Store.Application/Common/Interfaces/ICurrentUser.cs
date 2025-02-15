namespace Store.Application.Common.Interfaces;

public interface ICurrentUser
{
    string? Id { get; }
    string? Email { get; }
    IEnumerable<string> Roles { get; }
    bool IsAuthenticated { get; }
}