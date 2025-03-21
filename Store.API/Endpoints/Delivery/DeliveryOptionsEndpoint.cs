using FastEndpoints;

namespace Store.API.Endpoints.Delivery;
/// <summary>
/// 
/// </summary>
public class DeliveryOptionsEndpoint : Endpoint<GetDeliveryOptionsRequest, GetDeliveryOptionsResponse>
{/// <summary>
    /// 
    /// </summary>
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
    /// <summary>
    /// 
    /// </summary>
    public override async Task HandleAsync(GetDeliveryOptionsRequest req, CancellationToken ct)
    {
        var response = new GetDeliveryOptionsResponse
        {
            DeliveryOptions = new List<DeliveryOption>
            {
                new()
                {
                    Id = "postnord-home",
                    Name = "PostNord Hemleverans",
                    Description = "Leverans direkt till din dörr",
                    EstimatedDelivery = "1-3 arbetsdagar",
                    Price = 49,
                    Currency = "SEK",
                    Logo = "assets/delivery/postnord-logo.png"
                },
                new()
                {
                    Id = "postnord-pickup",
                    Name = "PostNord Ombud",
                    Description = "Hämta ditt paket hos ombud",
                    EstimatedDelivery = "1-2 arbetsdagar",
                    Price = 0,
                    Currency = "SEK",
                    Logo = "assets/delivery/postnord-logo.png"
                },
                new()
                {
                    Id = "instabox",
                    Name = "Instabox",
                    Description = "Leverans till Instabox-skåp",
                    EstimatedDelivery = "Inom 24 timmar",
                    Price = 29,
                    Currency = "SEK",
                    Logo = "assets/delivery/instabox-logo.png"
                },
                new()
                {
                    Id = "dhl",
                    Name = "DHL Express",
                    Description = "Expressleverans direkt till dörren",
                    EstimatedDelivery = "Nästa arbetsdag",
                    Price = 99,
                    Currency = "SEK",
                    Logo = "assets/delivery/dhl-logo.png"
                }
            }
        };
        await SendAsync(response, 200, ct);
    }
}
/// <summary>
/// 
/// </summary>
public class GetDeliveryOptionsRequest
{
    public string PostalCode { get; set; }
}
/// <summary>
/// 
/// </summary>
public class GetDeliveryOptionsResponse
{
    public List<DeliveryOption> DeliveryOptions { get; set; }
}
/// <summary>
/// 
/// </summary>
public class DeliveryOption
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string EstimatedDelivery { get; set; }
    public string Logo { get; set; }
    public string Currency { get; set; }
    public decimal Price { get; set; }
}

