using Microsoft.AspNetCore.SignalR;

namespace Store.API.Hubs;

public class StoreHub : Hub<IStoreHub>
{
    private readonly IConfiguration _configuration;

    public StoreHub(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task Ping(string ping)
    {
        ping = $"{ping} {_configuration["Environment"]}";
        await Clients.All.Ping(ping);
    }
}

public interface IStoreHub
{
    Task Ping(string ping);
}