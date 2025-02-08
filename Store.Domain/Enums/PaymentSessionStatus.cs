namespace Store.Domain.Enums;

public enum PaymentSessionStatus
{
    Created,
    Authorized,
    Completed,
    Failed,
    Expired,
    MaxAttemptsReached
}