using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Store.Application.Products.Models;

namespace Store.Application.Products.Queries;

public class GetProductDetailQuery(Guid id) : IRequest<ProductDetailDto>
{
    public Guid Id { get; init; } = id;
}