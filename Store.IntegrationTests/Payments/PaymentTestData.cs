using Bogus;
using Store.API.Endpoints.Payments.Models;
using Store.Domain.Entities.Order;
using Store.Domain.ValueObjects;

namespace Store.IntegrationTests.Payments;

public static class PaymentTestData
{
    private static readonly Faker _faker = new();

    public static CreatePaymentSessionRequest CreateValidSessionRequest()
    {
        return new CreatePaymentSessionRequest
        {
            Items = new List<OrderLineRequest>
            {
                new()
                {
                    ProductId = Guid.NewGuid(),
                    ProductName = _faker.Commerce.ProductName(),
                    Sku = _faker.Commerce.Ean13(),
                    Quantity = _faker.Random.Int(1, 5),
                    UnitPrice = decimal.Parse(_faker.Commerce.Price())
                }
            },
            Currency = "SEK",
            Locale = "sv-SE",
            Customer = new CustomerRequest
            {
                Email = _faker.Internet.Email(),
                Phone = _faker.Phone.PhoneNumber("+46 ## ### ## ##"),
                ShippingAddress = new AddressRequest
                {
                    Street = _faker.Address.StreetAddress(),
                    City = _faker.Address.City(),
                    State = _faker.Address.State(),
                    Country = "SE",
                    PostalCode = _faker.Address.ZipCode()
                }
            }
        };
    }

    public static Order CreateTestOrder(Money totalAmount, Address shippingAddress)
    {
        var orderLines = new List<OrderLine>
        {
            new(
                Guid.NewGuid(),
                Guid.NewGuid(),
                _faker.Commerce.ProductName(),
                _faker.Commerce.Ean13(), // Updated method
                1,
                totalAmount)
        };

        return new Order(
            _faker.Random.AlphaNumeric(10),
            null,
            shippingAddress,
            shippingAddress,
            totalAmount,
            orderLines);
    }
}