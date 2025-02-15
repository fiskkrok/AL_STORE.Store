namespace Store.Domain.Constants;

public static class ErrorCodes
{
    public static class Cart
    {
        public const string NotFound = "Cart.NotFound";
        public const string ItemNotFound = "Cart.ItemNotFound";
        public const string InsufficientStock = "Cart.InsufficientStock";
        public const string InvalidQuantity = "Cart.InvalidQuantity";
    }

    public static class Order
    {
        public const string NotFound = "Order.NotFound";
        public const string InvalidStatus = "Order.InvalidStatus";
        public const string PaymentFailed = "Order.PaymentFailed";
        public const string InvalidAddress = "Order.InvalidAddress";
    }

    public static class Customer
    {
        public const string NotFound = "Customer.NotFound";
        public const string InvalidEmail = "Customer.InvalidEmail";
        public const string DuplicateEmail = "Customer.DuplicateEmail";
    }
}