using FastEndpoints;
using MediatR;
using Store.Application.Customers.Commands.Adress;

namespace Store.API.Endpoints.Customers.Adress;

/// <summary>
/// 
/// </summary>
public class DeleteAddressEndpoint : EndpointWithoutRequest
{
    private readonly IMediator _mediator;

    /// <summary>
    /// 
    /// </summary>
    /// <param name="mediator"></param>
    public DeleteAddressEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }
    /// <summary>
    /// 
    /// </summary>
    public override void Configure()
    {
        Delete("/customers/addresses/{id}");
        Policies("RequireAuth"); // Use policy instead of Claims
        Permissions("write:profile");
        Description(d => d
            .Produces(204)
            .Produces(404)
            .WithTags("Customer Addresses"));
    }
    /// <summary>
    /// 
    /// </summary>
    public override async Task HandleAsync(CancellationToken ct)
    {
        var addressId = Route<Guid>("id");
        var command = new DeleteCustomerAddressCommand(addressId);
        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
            await SendNoContentAsync(ct);
        else
            await SendNotFoundAsync(ct);
    }
}