// src/app/core/models/product.model.ts
export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    sku: string;
    price: number;
    currency: string;
    stockLevel: number;
    isActive: boolean;
    categoryId: string;
    created: string;
    images: ProductImage[];
    variants: ProductVariant[];
    // Additional UI-specific fields
    compareAtPrice?: number;
    ratings?: {
        average: number;
        count: number;
    };
}

export interface ProductListResponse {
    items: Product[];
    total: number;
    page: number;
    pageSize: number;
    filters: ProductFilters;
}

export interface ProductImage {
    id: string;
    url: string;
    altText: string;
    isPrimary: boolean;
    displayOrder: number;
}

export interface ProductVariant {
    id: string;
    sku: string;
    name: string;
    price: number;
    currency: string;
    stockLevel: number;
    attributes: ProductVariantAttribute[];
}

export interface ProductVariantAttribute {
    name: string;
    value: string;
}

export interface ProductFilters {
    categories: CategoryAggregation[];
    priceRange: PriceRange;
    availableSizes?: string[];
}

export interface CategoryAggregation {
    categoryId: string;
    count: number;
}

export interface PriceRange {
    min: number;
    max: number;
}

export interface GetProductsRequest {
    page?: number;
    pageSize?: number;
    search?: string;
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'newest';
}

export interface SyncStatus {
    status: 'success' | 'error';
    message?: string;
}