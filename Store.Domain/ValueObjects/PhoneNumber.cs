﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Store.Domain.Common;

namespace Store.Domain.ValueObjects;
public class PhoneNumber : BaseValueObject
{
    public string Value { get; private set; }

    private PhoneNumber(string value)
    {
        Value = value;
    }

    public static Result<PhoneNumber> Create(string? number)
    {
        if (string.IsNullOrWhiteSpace(number))
        {
            return Result<PhoneNumber>.Failure(new Error("Phone.Empty", "Phone number cannot be empty"));
        }

        // Remove any non-digit characters
        var digitsOnly = new string(number.Where(char.IsDigit).ToArray());

        if (digitsOnly.Length < 10 || digitsOnly.Length > 15)
        {
            return Result<PhoneNumber>.Failure(new Error("Phone.Invalid", "Phone number must be between 10 and 15 digits"));
        }

        return Result<PhoneNumber>.Success(new PhoneNumber(digitsOnly));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
