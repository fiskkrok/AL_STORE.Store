using System.Net.Http.Headers;

using Duende.AccessTokenManagement;

public class ClientCredentialsTokenHandler : DelegatingHandler
{
    private readonly IClientCredentialsTokenManagementService _tokenManagementService;
    private readonly string _clientName;

    public ClientCredentialsTokenHandler(
        IClientCredentialsTokenManagementService tokenManagementService,
        string clientName)
    {
        _tokenManagementService = tokenManagementService;
        _clientName = clientName;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        var token = await _tokenManagementService.GetAccessTokenAsync(
            _clientName, null
            , cancellationToken);

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", token.ToString());

        return await base.SendAsync(request, cancellationToken);
    }
}