using FastEndpoints;

using Store.API.Endpoints.Payments.Models;

namespace Store.API.Endpoints.Delivery;

public class DeliveryOptionsEndpoint : Endpoint<GetDeliveryOptionsRequest, GetDeliveryOptionsResponse>
{
    public DeliveryOptionsEndpoint()
    {

    }
    public override void Configure()
    {
        Get("/delivery/options");
        AllowAnonymous();
        Description(d => d
            .WithTags("Checkout")
            .Produces<GetDeliveryOptionsResponse>(201)
            .ProducesProblem(404)
            .WithName("GetDeliveryOptions")
            .WithOpenApi());
    }

    public override async Task HandleAsync(GetDeliveryOptionsRequest req, CancellationToken ct)
    {
        var response = new GetDeliveryOptionsResponse
        {
            DeliveryOptions = new List<DeliveryOption>
            {
                new DeliveryOption
                {
                    Id = Guid.NewGuid(),
                    Name = "Standard",
                    Price = 5.99m,
                    EstimatedDelivery = TimeSpan.FromDays(3)
                },
                new DeliveryOption
                {
                    Id = Guid.NewGuid(),
                    Name = "Express",
                    Price = 9.99m,
                    EstimatedDelivery = TimeSpan.FromDays(1)
                }
            }
        };
        await SendAsync(response,200, ct);
    }
}

public class GetDeliveryOptionsRequest
{
    public string PostalCode { get; set; }
}

public class GetDeliveryOptionsResponse
{
    public List<DeliveryOption> DeliveryOptions { get; set; }
}

public class DeliveryOption
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public TimeSpan EstimatedDelivery { get; set; }
}
