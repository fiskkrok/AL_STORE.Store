using System.Net;

namespace Store.Domain.Exceptions

;

public class AdminApiException : Exception
{
    public AdminApiException(string message, HttpStatusCode statusCode)
        : base(message)
    {
        StatusCode = statusCode;
    }

    public HttpStatusCode StatusCode { get; }
}