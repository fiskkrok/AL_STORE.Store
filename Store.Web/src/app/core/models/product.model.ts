/* eslint-disable @typescript-eslint/no-explicit-any */
// core/models/product.model.ts
export interface Product {
    createdAt: string | number | Date;
    images: any;
    variants: any;
    id: string;
    name: string;
    compareAtPrice: number | null;
    description: string;
    price: number;
    stockLevel: number;
    imageUrl: string;
    categoryId: string;
    // Additional fields we might need:
    sku: string;
    brand: string;
    attributes: Record<string, string>;
    ratings: {
        average: number;
        count: number;
    };
    categories: string[];
    tags: string[];
}

export interface ProductFilter {
    search: string;
    categoryIds: string[];
    priceRange: {
        min: number;
        max: number;
    };
    sizes: string[];
    inStock: boolean;
    sortBy: 'featured' | 'price_asc' | 'price_desc' | 'newest';
}

export interface ProductImage {
    src: string;
    alt: string;
    id: string;
    url: string;
}