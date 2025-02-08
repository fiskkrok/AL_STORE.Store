namespace Store.Infrastructure.Services.Exceptions;

public class IdempotencyException : Exception
{
    public IdempotencyException(string message, Exception? innerException = null)
        : base(message, innerException)
    {
    }
}