using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Exceptions
;
public class AdminApiException : Exception
{
    public HttpStatusCode StatusCode { get; }

    public AdminApiException(string message, HttpStatusCode statusCode)
        : base(message)
    {
        StatusCode = statusCode;
    }
}
