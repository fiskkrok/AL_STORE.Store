﻿using Store.Domain.Common;

namespace Store.Domain.Entities.Product;

public class Category : BaseAuditableEntity
{
    private readonly List<Category> _children = new();

    // Constructor with all properties
    public Category(
        string name,
        string slug,
        string? description = null,
        string? imageUrl = null,
        Guid? parentId = null,
        int sortOrder = 0)
    {
        Name = name;
        Slug = slug;
        Description = description;
        ImageUrl = imageUrl;
        ParentId = parentId;
        SortOrder = sortOrder;
        IsActive = true;
    }

    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? ImageUrl { get; private set; }
    public Guid? ParentId { get; private set; }
    public bool IsActive { get; private set; }
    public int SortOrder { get; private set; }
    public string? MetaTitle { get; private set; }
    public string? MetaDescription { get; private set; }
    public IReadOnlyCollection<Category> Children => _children.AsReadOnly();

    // Method for updates
    public void Update(
        string name,
        string? description,
        string? imageUrl,
        Guid? parentId,
        int sortOrder,
        string? metaTitle = null,
        string? metaDescription = null)
    {
        Name = name;
        Description = description;
        ImageUrl = imageUrl;
        ParentId = parentId;
        SortOrder = sortOrder;
        MetaTitle = metaTitle;
        MetaDescription = metaDescription;

        AddDomainEvent(new CategoryUpdatedEvent(this));
    }
}