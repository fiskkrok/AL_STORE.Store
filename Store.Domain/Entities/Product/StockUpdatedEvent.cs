using Store.Domain.Common;

namespace Store.Domain.Entities.Product;

public class StockUpdatedEvent : BaseDomainEvent
{
    public StockUpdatedEvent(Guid id, int newStockLevel, bool b)
    {
        throw new NotImplementedException();
    }
}