using FastEndpoints;

using FluentValidation;

using Store.API.Endpoints.Customers;
using Store.API.Endpoints.Customers.Adress;

namespace Store.API.Validation;

public class AddressValidatorBase<T> : AbstractValidator<T> where T : AddAddressRequest
{
    private static readonly Dictionary<string, string> PostalCodePatterns = new()
    {
        { "SE", @"^\d{3}\s?\d{2}$" },      // Sweden: 123 45 or 12345
        { "NO", @"^\d{4}$" },              // Norway: 0123
        { "DK", @"^\d{4}$" },              // Denmark: 1234
        { "FI", @"^\d{5}$" },              // Finland: 12345
        { "DE", @"^\d{5}$" },              // Germany: 12345
        { "GB", @"^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$" }, // UK: AA1A 1AA
        { "US", @"^\d{5}(-\d{4})?$" }      // USA: 12345 or 12345-6789
    };

    protected AddressValidatorBase()
    {
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Address type is required")
            .Must(type => type.ToLower() is "shipping" or "billing")
            .WithMessage("Address type must be either 'shipping' or 'billing'");

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

        RuleFor(x => x.Street)
            .NotEmpty().WithMessage("Street is required")
            .MaximumLength(200).WithMessage("Street cannot exceed 200 characters");

        RuleFor(x => x.StreetNumber)
            .NotEmpty().WithMessage("Street number is required")
            .MaximumLength(20).WithMessage("Street number cannot exceed 20 characters")
            .Matches(@"^[0-9A-Za-z-/\s]+$")
            .WithMessage("Street number can only contain numbers, letters, hyphens, and forward slashes");

        When(x => !string.IsNullOrEmpty(x.Apartment), () =>
        {
            RuleFor(x => x.Apartment)
                .MaximumLength(20).WithMessage("Apartment cannot exceed 20 characters")
                .Matches(@"^[0-9A-Za-z-/\s]+$")
                .WithMessage("Apartment can only contain numbers, letters, hyphens, and forward slashes");
        });

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .MaximumLength(100).WithMessage("City cannot exceed 100 characters")
            .Matches(@"^[\p{L}\s-']+$")
            .WithMessage("City can only contain letters, spaces, hyphens and apostrophes");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State/Region is required")
            .MaximumLength(100).WithMessage("State/Region cannot exceed 100 characters");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required")
            .Length(2).WithMessage("Country must be a 2-letter ISO code")
            .Must(country => PostalCodePatterns.ContainsKey(country.ToUpper()))
            .WithMessage("Unsupported country code");

        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("Postal code is required")
            .MaximumLength(20).WithMessage("Postal code cannot exceed 20 characters")
            .Must((address, postalCode) =>
            {
                var country = address.Country.ToUpper();
                if (!PostalCodePatterns.TryGetValue(country, out var pattern))
                    return true; // Skip validation for unknown countries

                return System.Text.RegularExpressions.Regex.IsMatch(
                    postalCode.Replace(" ", ""), // Remove spaces for validation
                    pattern);
            })
            .WithMessage("Invalid postal code format for the specified country");

        When(x => !string.IsNullOrEmpty(x.Phone), () =>
        {
            RuleFor(x => x.Phone)
                .Matches(@"^\+?[1-9]\d{1,14}$")
                .WithMessage("Phone number must be in E.164 format (e.g., +46701234567)");
        });
    }
}

public class AddAddressValidator : AddressValidatorBase<AddAddressRequest>
{
    public AddAddressValidator() : base()
    {
        // Add any additional validation specific to adding a new address
    }
}

public class UpdateAddressValidator : AddressValidatorBase<UpdateAddressRequest>
{
    public UpdateAddressValidator() : base()
    {
        // Add any additional validation specific to updating an address
    }
}

public class SetDefaultAddressValidator : Validator<SetDefaultAddressRequest>
{
    public SetDefaultAddressValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Address type is required")
            .Must(type => type.ToLower() is "shipping" or "billing")
            .WithMessage("Address type must be either 'shipping' or 'billing'");
    }
}