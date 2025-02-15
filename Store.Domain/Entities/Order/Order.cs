using Store.Domain.Common;
using Store.Domain.Exceptions;
using Store.Domain.ValueObjects;

namespace Store.Domain.Entities.Order;

public class Order : BaseAuditableEntity
{
    private readonly List<OrderLine> _orderLines = new();
    private readonly List<PaymentAttempt> _paymentAttempts = new();

    private Order()
    {
    } // For EF Core

    public Order(
        string orderNumber,
        string? customerId,
        Address billingAddress,
        Address shippingAddress,
        Money totalAmount,
        IEnumerable<OrderLine> orderLines)
    {
        OrderNumber = orderNumber;
        CustomerId = customerId;
        BillingAddress = billingAddress;
        ShippingAddress = shippingAddress;
        TotalAmount = totalAmount;
        Status = OrderStatus.Pending;

        _orderLines.AddRange(orderLines);
        AddDomainEvent(new OrderCreatedEvent(this));
    }

    public string OrderNumber { get; private set; }
    public OrderStatus Status { get; private set; }
    public string? CustomerId { get; private set; } // Null for guest checkout
    public Address BillingAddress { get; private set; }
    public Address ShippingAddress { get; private set; }
    public Money TotalAmount { get; private set; }
    public string? KlarnaOrderReference { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    public IReadOnlyCollection<OrderLine> OrderLines => _orderLines.AsReadOnly();
    public IReadOnlyCollection<PaymentAttempt> PaymentAttempts => _paymentAttempts.AsReadOnly();

    public void AddPaymentAttempt(PaymentSession session)
    {
        var attempt = new PaymentAttempt(Id, session.Id);
        _paymentAttempts.Add(attempt);
    }

    public void SetKlarnaReference(string reference)
    {
        KlarnaOrderReference = reference;
        AddDomainEvent(new KlarnaReferenceAddedEvent(Id, reference));
    }

    public void Complete()
    {
        if (Status != OrderStatus.Processing)
            throw new DomainException("Order must be in Processing state to complete");

        Status = OrderStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        AddDomainEvent(new OrderCompletedEvent(this));
    }

    public void Fail(string reason)
    {
        Status = OrderStatus.Failed;
        AddDomainEvent(new OrderFailedEvent(Id, reason));
    }
}

public class KlarnaReferenceAddedEvent(Guid id, string reference) : BaseDomainEvent
{
    public Guid Id { get; } = id;
    public string Reference { get; } = reference;
}

// Domain Events