using Store.Domain.Common;
using Store.Domain.Constants;

namespace Store.Domain.ValueObjects;

public class Quantity : BaseValueObject
{
    private Quantity(int value)
    {
        Value = value;
    }

    public int Value { get; }

    public static Result<Quantity> Create(int value)
    {
        if (value < 0) return Result<Quantity>.Failure(new Error("Quantity.Negative", "Quantity cannot be negative"));

        if (value > CartConstants.MaxItemQuantity)
            return Result<Quantity>.Failure(
                new Error("Quantity.TooLarge", $"Quantity cannot be larger than {CartConstants.MaxItemQuantity}"));

        return Result<Quantity>.Success(new Quantity(value));
    }

    public Quantity Add(Quantity other)
    {
        return new Quantity(Value + other.Value);
    }

    public Quantity Subtract(Quantity other)
    {
        return new Quantity(Math.Max(0, Value - other.Value));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}