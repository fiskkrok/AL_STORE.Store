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
    public string Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string EstimatedDelivery { get; set; }
    public string Logo { get; set; }
    public string Currency { get; set; }
    public decimal Price { get; set; }
}



//{
//id: 'postnord-home',
//name: 'PostNord Hemleverans',
//description: 'Leverans direkt till din dörr',
//estimatedDelivery: '1-3 arbetsdagar',
//price: 49,
//currency: 'SEK',
//logo: 'assets/delivery/postnord.svg'
//},
//{
//id: 'postnord-pickup',
//name: 'PostNord Ombud',
//description: 'Hämta ditt paket hos ombud',
//estimatedDelivery: '1-2 arbetsdagar',
//price: 0,
//currency: 'SEK',
//logo: 'assets/delivery/postnord.svg'
//},
//{
//id: 'instabox',
//name: 'Instabox',
//description: 'Leverans till Instabox-skåp',
//estimatedDelivery: 'Inom 24 timmar',
//price: 29,
//currency: 'SEK',
//logo: 'assets/delivery/instabox.svg'
//},
//{
//id: 'dhl',
//name: 'DHL Express',
//description: 'Expressleverans direkt till dörren',
//estimatedDelivery: 'Nästa arbetsdag',
//price: 99,
//currency: 'SEK',
//logo: 'assets/delivery/dhl.svg'
//}