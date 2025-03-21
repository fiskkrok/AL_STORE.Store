using FastEndpoints;
using MediatR;
using Store.Application.Customers.Commands.Adress;
using Store.Domain.Entities.Customer;

namespace Store.API.Endpoints.Customers.Adress;
/// <summary>
/// 
/// </summary>
public class SetDefaultAddressRequest
{
    /// <summary>
    /// </summary>
    public string Type { get; init; } = string.Empty;
}
/// <summary>
/// 
/// </summary>
public class SetDefaultAddressEndpoint : Endpoint<SetDefaultAddressRequest>
{
    private readonly IMediator _mediator;
    /// <summary>
    /// 
    /// </summary>
    public SetDefaultAddressEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }
    /// <summary>
    /// 
    /// </summary>
    public override void Configure()
    {
        Post("/customers/addresses/{id}/default");
        Policies("RequireAuth"); // Use policy instead of Claims
        Permissions("write:profile");
        Description(d => d
            .Produces(200)
            .ProducesProblem(400)
            .Produces(404)
            .WithTags("Customer Addresses"));
    }
    /// <summary>
    /// 
    /// </summary>
    public override async Task HandleAsync(SetDefaultAddressRequest req, CancellationToken ct)
    {
        var addressId = Route<Guid>("id");
        var command = new SetDefaultAddressCommand(
            addressId,
            Enum.Parse<AddressType>(req.Type, true));

        var result = await _mediator.Send(command, ct);

        if (result.IsSuccess)
        {
            await SendOkAsync(ct);
        }
        else if (result.Errors.Any(e => e.Code == "Address.NotFound"))
        {
            await SendNotFoundAsync(ct);
        }
        else
        {
            foreach (var error in result.Errors) AddError(error.Message);
            await SendErrorsAsync(400, ct);
        }
    }
}