namespace Store.Domain.Common;

public class Result<T>
{
    private readonly List<Error> _errors = new();

    private Result(bool isSuccess, T? value, IEnumerable<Error>? errors = null)
    {
        IsSuccess = isSuccess;
        Value = value;
        if (errors != null) _errors.AddRange(errors);
    }

    public T? Value { get; }
    public bool IsSuccess { get; }
    public IReadOnlyList<Error> Errors => _errors.AsReadOnly();

    public static Result<T> Success(T value)
    {
        return new Result<T>(true, value);
    }

    public static Result<T> Failure(IEnumerable<Error> errors)
    {
        return new Result<T>(false, default, errors);
    }

    public static Result<T> Failure(Error error)
    {
        return new Result<T>(false, default, new[] { error });
    }
}