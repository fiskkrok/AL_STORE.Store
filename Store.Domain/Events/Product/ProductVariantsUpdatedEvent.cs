using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Store.Domain.Common;

namespace Store.Domain.Events.Product;
public class ProductVariantsUpdatedEvent : BaseDomainEvent
{
    public ProductVariantsUpdatedEvent(Guid id, List<Guid> variantIds)
    {
        throw new NotImplementedException();
    }
}
