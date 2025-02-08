namespace Store.Infrastructure.Services.Exceptions;

public class ProductSyncException : Exception
{
    public ProductSyncException(string productSyncFailed, Exception exception)
    {
        throw new NotImplementedException();
    }
}