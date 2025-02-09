using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;
using Store.Application.Customers.Models;
using Store.Application.Payments.Models;
using Store.Domain.Entities.Customer;

namespace Store.Application.Mappings;
public class CustomerMappingProfile : Profile
{
    public CustomerMappingProfile()
    {
        CreateMap<CustomerProfile, CustomerProfileDto>()
            .ForMember(d => d.Email, o => o.MapFrom(s => s.Email.Value))
            .ForMember(d => d.Phone, o => o.MapFrom(s => s.Phone != null ? s.Phone.Value : null));

        CreateMap<CustomerAddress, AddressDto>()
            .ForMember(d => d.Street, o => o.MapFrom(s => s.Street))
            .ForMember(d => d.City, o => o.MapFrom(s => s.City))
            .ForMember(d => d.State, o => o.MapFrom(s => s.State))
            .ForMember(d => d.Country, o => o.MapFrom(s => s.Country))
            .ForMember(d => d.PostalCode, o => o.MapFrom(s => s.PostalCode))
            .ForMember(d => d.Type, o => o.MapFrom(s => s.Type.ToString().ToLower()));
    }
}