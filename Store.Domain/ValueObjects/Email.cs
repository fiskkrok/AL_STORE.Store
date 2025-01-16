using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Store.Domain.Common;

namespace Store.Domain.ValueObjects;
public class Email : BaseValueObject
{
    public string Value { get; private set; }

    private Email(string value)
    {
        Value = value;
    }

    public static Result<Email> Create(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return Result<Email>.Failure(new Error("Email.Empty", "Email cannot be empty"));
        }

        email = email.Trim();
        if (email.Length > 256)
        {
            return Result<Email>.Failure(new Error("Email.TooLong", "Email is too long"));
        }

        if (!System.Text.RegularExpressions.Regex.IsMatch(email, @"^(.+)@(.+)$"))
        {
            return Result<Email>.Failure(new Error("Email.Invalid", "Email is invalid"));
        }

        return Result<Email>.Success(new Email(email));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value.ToLowerInvariant();
    }

    public override string ToString() => Value;
}
