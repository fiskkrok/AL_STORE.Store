using FastEndpoints;
using FluentValidation;
using Store.API.Endpoints.Customers.Models;
using Store.API.Endpoints.Customers.Profile;
using Store.Application.Customers.Models;

namespace Store.API.Validation;

public class CreateProfileValidator : Validator<ProfilePayload>
{
    public CreateProfileValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(100).WithMessage("First name cannot exceed 100 characters")
            .Matches(@"^[\p{L}\s-']+$")
            .WithMessage("First name can only contain letters, spaces, hyphens and apostrophes");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(100).WithMessage("Last name cannot exceed 100 characters")
            .Matches(@"^[\p{L}\s-']+$")
            .WithMessage("Last name can only contain letters, spaces, hyphens and apostrophes");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(256).WithMessage("Email cannot exceed 256 characters");

        When(x => !string.IsNullOrEmpty(x.Phone), () =>
        {
            RuleFor(x => x.Phone)
                .Matches(@"^\+?[1-9]\d{1,14}$")
                .WithMessage("Phone number must be in E.164 format (e.g., +46701234567)");
        });
    }
}

public class UpdateProfileValidator : Validator<UpdateProfileRequest>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(100).WithMessage("First name cannot exceed 100 characters")
            .Matches(@"^[\p{L}\s-']+$")
            .WithMessage("First name can only contain letters, spaces, hyphens and apostrophes");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(100).WithMessage("Last name cannot exceed 100 characters")
            .Matches(@"^[\p{L}\s-']+$")
            .WithMessage("Last name can only contain letters, spaces, hyphens and apostrophes");

        When(x => !string.IsNullOrEmpty(x.Phone), () =>
        {
            RuleFor(x => x.Phone)
                .Matches(@"^\+?[1-9]\d{1,14}$")
                .WithMessage("Phone number must be in E.164 format (e.g., +46701234567)");
        });

        RuleFor(x => x.Preferences)
            .SetValidator(new CustomerPreferencesValidator());
    }
}

public class CustomerPreferencesValidator : Validator<CustomerPreferencesDto>
{
    private static readonly string[] ValidLanguages = { "en", "sv", "no", "da", "fi" };
    private static readonly string[] ValidCurrencies = { "USD", "EUR", "SEK", "NOK", "DKK" };

    public CustomerPreferencesValidator()
    {
        RuleFor(x => x.PreferredLanguage)
            .Must(lang => ValidLanguages.Contains(lang.ToLower()))
            .WithMessage($"Language must be one of: {string.Join(", ", ValidLanguages)}");

        RuleFor(x => x.PreferredCurrency)
            .Must(curr => ValidCurrencies.Contains(curr.ToUpper()))
            .WithMessage($"Currency must be one of: {string.Join(", ", ValidCurrencies)}");
    }
}