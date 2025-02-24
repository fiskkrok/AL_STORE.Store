namespace Store.API.Endpoints.Payments.Models;

/// <summary>
/// Represents a request to get a payment session.
/// </summary>
public class GetPaymentSessionRequest
{
    /// <summary>
    /// Gets the unique identifier of the payment session.
    /// </summary>
    public Guid Id { get; init; }
}
