﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Store.Domain.Common;
using Store.Domain.Events.Product;
using Store.Domain.Exceptions;
using Store.Domain.ValueObjects;

namespace Store.Domain.Entities.Product;

public class ProductVariant : BaseEntity
{
    public string Sku { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public Money Price { get; private set; } = Money.Zero();
    public int StockLevel { get; private set; }
    public Guid ProductId { get; private set; }

    private readonly List<ProductVariantAttribute> _attributes = new();
    public IReadOnlyCollection<ProductVariantAttribute> Attributes => _attributes.AsReadOnly();

    private ProductVariant()
    {
    }

    public ProductVariant(
        string sku,
        string name,
        Money price,
        int stockLevel,
        Guid productId)
    {
        Sku = sku;
        Name = name;
        Price = price;
        StockLevel = stockLevel;
        ProductId = productId;
    }

    public void UpdateStock(int newStockLevel)
    {
        if (newStockLevel < 0)
            throw new DomainException("Stock level cannot be negative");

        StockLevel = newStockLevel;
    }


    public void Update(string variantSku, string variantName, Money variantPrice, int variantStockLevel)
    {
        Sku = variantSku;
        Name = variantName;
        Price = variantPrice;
        StockLevel = variantStockLevel;
    }

}

