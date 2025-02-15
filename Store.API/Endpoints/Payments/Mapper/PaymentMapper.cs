using FastEndpoints;
using Store.API.Endpoints.Payments.Models;
using Store.Application.Payments.Commands;
using Store.Application.Payments.Models;

namespace Store.API.Endpoints.Payments.Mapper;

public class
    PaymentMapper : Mapper<CreatePaymentSessionRequest, CreatePaymentSessionResponse, CreatePaymentSessionCommand>
{
    public override CreatePaymentSessionCommand ToEntity(CreatePaymentSessionRequest r)
    {
        return new CreatePaymentSessionCommand
        {
            Items = r.Items.Select(x => new OrderLineDto
            {
                ProductId = x.ProductId,
                ProductName = x.ProductName,
                Sku = x.Sku,
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice
            }).ToList(),
            Currency = r.Currency,
            Locale = r.Locale,
            Customer = new CustomerDto
            {
                Email = r.Customer.Email,
                Phone = r.Customer.Phone,
                ShippingAddress = r.Customer.ShippingAddress != null
                    ? new AddressDto
                    {
                        // Map AddressRequest properties to AddressDto properties here
                        Street = r.Customer.ShippingAddress.Street,
                        City = r.Customer.ShippingAddress.City,
                        State = r.Customer.ShippingAddress.State,
                        PostalCode = r.Customer.ShippingAddress.PostalCode,
                        Country = r.Customer.ShippingAddress.Country
                    }
                    : null
            }
        };
    }

    //public override CreatePaymentSessionResponse FromEntity(CreatePaymentSessionCommand e) => new()
    //{
    //    SessionId = Guid.NewGuid(),
    //    ClientToken = GenerateClientToken(),
    //    ExpiresAt = DateTime.UtcNow.AddHours(1),
    //    PaymentMethods = GetPaymentMethods()
    //};

    //private string GenerateClientToken()
    //{
    //    // Implementation to generate a client token
    //    return Guid.NewGuid().ToString();
    //}

    //private List<PaymentMethodResponse> GetPaymentMethods()
    //{
    //    // Implementation to retrieve available payment methods
    //    return new List<PaymentMethodResponse>
    //    {
    //        new PaymentMethodResponse
    //        {
    //            Id = "pm_1",
    //            Name = "Credit Card",
    //            Allowed = true
    //        },
    //        new PaymentMethodResponse
    //        {
    //            Id = "pm_2",
    //            Name = "PayPal",
    //            Allowed = true
    //        }
    //    };
    //}
}