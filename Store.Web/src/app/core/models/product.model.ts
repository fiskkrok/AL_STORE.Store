// core/models/product.model.ts
export interface Product {
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
export interface ProductToCartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    variantId?: string;
}

export function mapProductToCartItem(product: Product, quantity: number = 1): ProductToCartItem {
    return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.images[0]?.url || product.imageUrl,
        // Add variantId if needed
    };
}
export interface ProductFilter {
    categoryId: string;
    minPrice: number;
    maxPrice: number;
    search?: string;
    categoryIds?: string[];
    priceRange?: {
        min: number;
        max: number;
    };
    brands?: string[];
    attributes?: Record<string, string[]>;
    inStock?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating';
}

export interface ProductImage {
    src: string;
    alt: string;
    id: string;
    url: string;
}