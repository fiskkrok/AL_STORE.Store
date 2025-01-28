using MediatR;
using Store.Application.Products.Models;

namespace Store.Application.Products.Queries;

public class GetProductDetailQueryHandler : IRequestHandler<GetProductDetailQuery, ProductDetailDto>
{
    public Task<ProductDetailDto> Handle(GetProductDetailQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}