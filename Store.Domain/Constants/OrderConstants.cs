namespace Store.Domain.Constants;

public static class OrderConstants
{
    public const int MaxItemsPerOrder = 50;
    public const decimal MinOrderAmount = 1.00M;
    public const int PaymentTimeoutMinutes = 30;
}