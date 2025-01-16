using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Common;
public class Result<T>
{
    private readonly List<Error> _errors = new();

    public T? Value { get; }
    public bool IsSuccess { get; }
    public IReadOnlyList<Error> Errors => _errors.AsReadOnly();

    private Result(bool isSuccess, T? value, IEnumerable<Error>? errors = null)
    {
        IsSuccess = isSuccess;
        Value = value;
        if (errors != null)
        {
            _errors.AddRange(errors);
        }
    }

    public static Result<T> Success(T value) => new(true, value);
    public static Result<T> Failure(IEnumerable<Error> errors) => new(false, default, errors);
    public static Result<T> Failure(Error error) => new(false, default, new[] { error });
}
