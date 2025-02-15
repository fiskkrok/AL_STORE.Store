using FastEndpoints;
using MediatR;
using Store.Application.Customers.Commands.Adress;

namespace Store.API.Endpoints.Customers.Adress;

public class DeleteAddressEndpoint : EndpointWithoutRequest
{
    private readonly IMediator _mediator;

    public DeleteAddressEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Delete("/customers/addresses/{id}");
        Claims("sub");
        Description(d => d
            .Produces(204)
            .Produces(404)
            .WithTags("Customer Addresses"));
    }

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