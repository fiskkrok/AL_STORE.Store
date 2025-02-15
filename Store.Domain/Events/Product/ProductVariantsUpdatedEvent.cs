using Store.Domain.Common;

namespace Store.Domain.Events.Product;

public class ProductVariantsUpdatedEvent : BaseDomainEvent
{
    public ProductVariantsUpdatedEvent(Guid id, List<Guid> variantIds)
    {
        throw new NotImplementedException();
    }
}