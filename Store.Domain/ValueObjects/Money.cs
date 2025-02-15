using Store.Domain.Common;

namespace Store.Domain.ValueObjects;

public class Money : BaseValueObject
{
    private const int DecimalPrecision = 2;
    private const int MaxDigits = 18;

    private Money(decimal amount, string currency)
    {
        // Round to ensure consistent precision
        Amount = decimal.Round(amount, DecimalPrecision, MidpointRounding.AwayFromZero);
        Currency = currency;
    }

    public decimal Amount { get; }
    public string Currency { get; }

    public static Result<Money> Create(decimal amount, string currency)
    {
        if (currency.Length != 3)
            return Result<Money>.Failure(new Error("400", "Invalid currency code"));

        if (amount < 0)
            return Result<Money>.Failure(new Error("400", "Amount cannot be negative"));

        // Check for overflow/precision issues
        try
        {
            var roundedAmount = decimal.Round(amount, DecimalPrecision);
            if (roundedAmount >= (decimal)Math.Pow(10, MaxDigits - DecimalPrecision))
                return Result<Money>.Failure(new Error("400", "Amount too large"));

            return Result<Money>.Success(new Money(roundedAmount, currency.ToUpper()));
        }
        catch (OverflowException)
        {
            return Result<Money>.Failure(new Error("400", "Amount out of range"));
        }
    }

    public static Money FromDecimal(decimal amount, string currency = "USD")
    {
        return new Money(amount, currency);
    }

    public static Money Zero(string currency = "USD")
    {
        return new Money(0, currency);
    }

    public Money Add(Money other)
    {
        if (other.Currency != Currency)
            throw new InvalidOperationException("Cannot add money with different currencies");

        return new Money(Amount + other.Amount, Currency);
    }

    public Money Subtract(Money other)
    {
        if (other.Currency != Currency)
            throw new InvalidOperationException("Cannot subtract money with different currencies");

        return new Money(Amount - other.Amount, Currency);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }

    public override string ToString()
    {
        return $"{Amount:F2} {Currency}";
    }
}