using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Store.Application.Payments.Models;

namespace Store.Application.Payments.Queries;

public class GetPaymentSessionQuery : IRequest<PaymentSessionDto>
{
    public GetPaymentSessionQuery(Guid id)
    {
        Id = id;
    }
    public Guid Id { get; }
}
internal class GetPaymentSessionQueryHandler : IRequestHandler<GetPaymentSessionQuery, PaymentSessionDto>
{
    public Task<PaymentSessionDto> Handle(GetPaymentSessionQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}