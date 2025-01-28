using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Store.Domain.Common;

namespace Store.Domain.Entities.Product;
public class Category : BaseAuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? ImageUrl { get; private set; }
    public Guid? ParentId { get; private set; }
    public bool IsActive { get; private set; }

    private readonly List<Category> _children = new();
    public IReadOnlyCollection<Category> Children => _children.AsReadOnly();

    private Category() { }

    public Category(
        string name,
        string slug,
        string? description = null,
        string? imageUrl = null,
        Guid? parentId = null)
    {
        Name = name;
        Slug = slug;
        Description = description;
        ImageUrl = imageUrl;
        ParentId = parentId;
        IsActive = true;
    }

    public void Update(
        string name,
        string? description,
        string? imageUrl,
        Guid? parentId)
    {
        Name = name;
        Description = description;
        ImageUrl = imageUrl;
        ParentId = parentId;

        AddDomainEvent(new CategoryUpdatedEvent(this));
    }
}

public class CategoryUpdatedEvent : BaseDomainEvent
{
    public CategoryUpdatedEvent(Category category)
    {
        Category = category;

    }

    public Category Category { get; set; }

}

