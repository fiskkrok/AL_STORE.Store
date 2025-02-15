namespace Store.API.Endpoints.Payments.Models;

//public class CreatePaymentSessionValidator : Validator<CreatePaymentSessionRequest>
//{
//    public CreatePaymentSessionValidator()
//    {
//        RuleFor(x => x.Items)
//            .NotEmpty().WithMessage("At least one item is required");

//        RuleFor(x => x.Currency)
//            .NotEmpty()
//            .Length(3)
//            .Matches("^[A-Z]{3}$")
//            .WithMessage("Currency must be a valid 3-letter code");

//        RuleFor(x => x.Locale)
//            .NotEmpty()
//            .Matches("^[a-z]{2}-[A-Z]{2}$")
//            .WithMessage("Locale must be in format 'xx-XX'");

//        RuleFor(x => x.Customer.Email)
//            .NotEmpty()
//            .EmailAddress()
//            .WithMessage("Valid email is required");

//        When(x => x.Customer.Phone != null, () =>
//        {
//            RuleFor(x => x.Customer.Phone)
//                .Matches(@"^\+?[\d\s-]{8,}$")
//                .WithMessage("Phone number must be valid");
//        });

//        When(x => x.Customer.ShippingAddress != null, () =>
//        {
//            RuleFor(x => x.Customer.ShippingAddress.Street).NotEmpty();
//            RuleFor(x => x.Customer.ShippingAddress.City).NotEmpty();
//            RuleFor(x => x.Customer.ShippingAddress.State).NotEmpty();
//            RuleFor(x => x.Customer.ShippingAddress.Country).NotEmpty();
//            RuleFor(x => x.Customer.ShippingAddress.PostalCode).NotEmpty();
//        });
//    }
//}