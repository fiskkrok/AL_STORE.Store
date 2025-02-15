using Store.Domain.Common;
using Store.Domain.Enums;
using Store.Domain.Exceptions;
using Store.Domain.ValueObjects;

namespace Store.Domain.Entities.Order;

public class PaymentSession : BaseEntity
{
    private PaymentSession()
    {
    } // For EF Core

    public PaymentSession(
        Guid orderId,
        string clientToken,
        string paymentMethod,
        Money amount,
        TimeSpan? expirationPeriod = null)
    {
        OrderId = orderId;
        ClientToken = clientToken;
        PaymentMethod = paymentMethod;
        Amount = amount;
        Status = PaymentSessionStatus.Created;
        ExpiresAt = DateTime.UtcNow.Add(expirationPeriod ?? TimeSpan.FromMinutes(30));
        AttemptCount = 0;

        AddDomainEvent(new PaymentSessionCreatedEvent(this));
    }

    public Guid OrderId { get; private set; }
    public string ClientToken { get; private set; }
    public PaymentSessionStatus Status { get; private set; }
    public DateTime ExpiresAt { get; }
    public string PaymentMethod { get; private set; }
    public Money Amount { get; private set; }
    public int AttemptCount { get; private set; }

    public bool IsExpired()
    {
        return DateTime.UtcNow > ExpiresAt;
    }

    public bool CanRetry()
    {
        return AttemptCount < 3 && !IsExpired();
    }

    public void IncrementAttempt()
    {
        AttemptCount++;
        if (AttemptCount >= 3)
        {
            Status = PaymentSessionStatus.MaxAttemptsReached;
            AddDomainEvent(new PaymentSessionMaxAttemptsReachedEvent(Id));
        }
    }

    public void Authorize()
    {
        if (IsExpired())
            throw new DomainException("Cannot authorize expired session");

        Status = PaymentSessionStatus.Authorized;
        AddDomainEvent(new PaymentSessionAuthorizedEvent(this));
    }
}

public class PaymentSessionMaxAttemptsReachedEvent : BaseDomainEvent
{
    public PaymentSessionMaxAttemptsReachedEvent(Guid id)
    {
        Id = id;
    }

    public Guid Id { get; }
}