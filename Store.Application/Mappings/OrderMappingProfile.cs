using AutoMapper;

using Store.Application.Orders.Models;
using Store.Domain.Entities.Order;

namespace Store.Application.Mappings;

public class OrderMappingProfile : Profile
{
    public OrderMappingProfile()
    {
        CreateMap<Order, OrderSummaryDto>()
            .ForMember(d => d.TotalAmount, o => o.MapFrom(s => s.TotalAmount.Amount))
            .ForMember(d => d.Currency, o => o.MapFrom(s => s.TotalAmount.Currency))
            .ForMember(d => d.ItemCount, o => o.MapFrom(s => s.OrderLines.Count));

        CreateMap<Order, OrderDetailDto>()
            .ForMember(d => d.TotalAmount, o => o.MapFrom(s => s.TotalAmount.Amount))
            .ForMember(d => d.Currency, o => o.MapFrom(s => s.TotalAmount.Currency));

        CreateMap<OrderLine, OrderLineItemDto>()
            .ForMember(d => d.UnitPrice, o => o.MapFrom(s => s.UnitPrice.Amount))
            .ForMember(d => d.LineTotal, o => o.MapFrom(s => s.LineTotal.Amount))
            .ForMember(d => d.Currency, o => o.MapFrom(s => s.UnitPrice.Currency));
    }
}