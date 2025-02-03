using MediatR;

using Microsoft.Extensions.Logging;

using Store.Application.Common.Interfaces;
using Store.Application.Products.Models;
using Store.Domain.Common;
using Store.Domain.Entities;
using Store.Domain.Entities.Product; // Add this line to include the Product entity

namespace Store.Application.Products.Queries;

public class GetProductDetailQueryHandler : IRequestHandler<GetProductDetailQuery, ProductDetailDto>
{
    private IStoreDbContext _context;
    private ILogger<GetProductDetailQueryHandler> _logger;
    public GetProductDetailQueryHandler(IStoreDbContext context, ILogger<GetProductDetailQueryHandler> logger)
    {
        this._context = context;
        this._logger = logger;
    }

    public async Task<ProductDetailDto> Handle(GetProductDetailQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.Set<Product>().FindAsync(new object[] { request.Id }, cancellationToken);
        if (product == null)
        {
            _logger.LogWarning("Product with Id {ProductId} not found.", request.Id);
            return null;
        }

        var productDetailDto = new ProductDetailDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price.Amount,
            Variants = product.Variants.Select(v => new ProductVariantDto
            {
                Id = v.Id,
                Name = v.Name,
                Price = v.Price.Amount
            }).ToList(),
            //Attributes = product.Attributes,
            //RelatedProducts = product.RelatedProducts.Select(rp => new ProductDto
            //{
            //    Id = rp.Id,
            //    Name = rp.Name,
            //    Price = rp.Price
            //}).ToList()
        };

        return productDetailDto;
    }
}