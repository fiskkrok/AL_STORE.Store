using Store.Domain.Common;

namespace Store.Domain.Entities.Product;

public class CategoryUpdatedEvent : BaseDomainEvent
{
    public CategoryUpdatedEvent(Category category)
    {
        Category = category;
    }

    public Category Category { get; set; }
}