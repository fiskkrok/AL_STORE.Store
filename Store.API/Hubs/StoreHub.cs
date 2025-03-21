using Microsoft.AspNetCore.SignalR;

namespace Store.API.Hubs;
/// <summary>
/// 
/// </summary>
public class StoreHub : Hub<IStoreHub>
{
    private readonly IConfiguration _configuration;
    /// <summary>
    /// 
    /// </summary>
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
/// <summary>
/// 
/// </summary>
public interface IStoreHub
{
    Task Ping(string ping);
}