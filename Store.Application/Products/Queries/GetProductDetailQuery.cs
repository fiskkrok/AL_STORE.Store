using MediatR;
using Store.Application.Products.Models;

namespace Store.Application.Products.Queries;

public class GetProductDetailQuery(Guid id) : IRequest<ProductDetailDto>
{
    public Guid Id { get; init; } = id;
}