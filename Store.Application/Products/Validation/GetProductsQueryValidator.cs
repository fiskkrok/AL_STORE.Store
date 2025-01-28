using FluentValidation;
using Store.Application.Products.Queries;

namespace Store.Application.Products.Validation;

public class GetProductsQueryValidator : AbstractValidator<GetProductsQuery>
{
    public GetProductsQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0)
            .WithMessage("Page number must be greater than 0");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("Page size must be between 1 and 100");

        When(x => x.MinPrice.HasValue, () =>
        {
            RuleFor(x => x.MinPrice!.Value)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Minimum price cannot be negative");
        });

        When(x => x.MaxPrice.HasValue, () =>
        {
            RuleFor(x => x.MaxPrice!.Value)
                .GreaterThanOrEqualTo(x => x.MinPrice ?? 0)
                .WithMessage("Maximum price must be greater than or equal to minimum price");
        });

        When(x => !string.IsNullOrEmpty(x.SortBy), () =>
        {
            RuleFor(x => x.SortBy)
                .Must(sortBy => new[] { "price_asc", "price_desc", "newest" }.Contains(sortBy.ToLower()))
                .WithMessage("Invalid sort option. Valid options are: price_asc, price_desc, newest");
        });
    }
}