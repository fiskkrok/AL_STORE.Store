using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using MediatR;

using Microsoft.Extensions.Logging;
using Store.Domain.Common;

namespace Store.Application.Payments.Commands;
public class AuthorizePaymentCommand : IRequest<AuthorizePaymentResponse>
{
    public string IdempotencyKey { get; set; } = string.Empty;

}

public class AuthorizePaymentHandler : IRequestHandler<AuthorizePaymentCommand, AuthorizePaymentResponse>
{
    private readonly ILogger<AuthorizePaymentHandler> _logger;
    public AuthorizePaymentHandler(ILogger<AuthorizePaymentHandler> logger)
    {
        _logger = logger;
    }
    public async Task<AuthorizePaymentResponse> Handle(AuthorizePaymentCommand request, CancellationToken cancellationToken)
    {
        // Simulate payment authorization
        await Task.Delay(1000);
        return new AuthorizePaymentResponse
        {
            PaymentId = Guid.NewGuid(),
            Status = "Authorized"
        };
    }
}

public class AuthorizePaymentResponse
{
    public Guid PaymentId { get; set; }
    public string Status { get; set; }
}