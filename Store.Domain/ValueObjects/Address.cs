using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Store.Domain.Common;

namespace Store.Domain.ValueObjects;
public class Address : BaseValueObject
{
    public string Street { get; private set; }
    public string City { get; private set; }
    public string State { get; private set; }
    public string Country { get; private set; }
    public string PostalCode { get; private set; }

    private Address(string street, string city, string state, string country, string postalCode)
    {
        Street = street;
        City = city;
        State = state;
        Country = country;
        PostalCode = postalCode;
    }

    public static Result<Address> Create(string street, string city, string state, string country, string postalCode)
    {
        var errors = new List<Error>();

        if (string.IsNullOrWhiteSpace(street))
            errors.Add(new Error("Address.Street.Empty", "Street cannot be empty"));

        if (string.IsNullOrWhiteSpace(city))
            errors.Add(new Error("Address.City.Empty", "City cannot be empty"));

        if (string.IsNullOrWhiteSpace(state))
            errors.Add(new Error("Address.State.Empty", "State cannot be empty"));

        if (string.IsNullOrWhiteSpace(country))
            errors.Add(new Error("Address.Country.Empty", "Country cannot be empty"));

        if (string.IsNullOrWhiteSpace(postalCode))
            errors.Add(new Error("Address.PostalCode.Empty", "Postal code cannot be empty"));

        if (errors.Any())
            return Result<Address>.Failure(errors);

        return Result<Address>.Success(new Address(
            street.Trim(),
            city.Trim(),
            state.Trim(),
            country.Trim(),
            postalCode.Trim()));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return State;
        yield return Country;
        yield return PostalCode;
    }

    public override string ToString()
    {
        return $"{Street}, {City}, {State} {PostalCode}, {Country}";
    }
}