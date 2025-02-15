namespace Store.Domain.Common;

public record Error(string Code, string Message)
{
    public static Error None = new(string.Empty, string.Empty);
}