// src/app/core/services/product.service.ts
// imports

import { Injectable, inject, computed } from "@angular/core";

import { Observable, of, tap, map } from "rxjs";
import { Product, ProductQueryParams, ProductListResponse } from "../../shared/models";
import { CartStore } from "../state";
import { ApiService } from "./api.service";
import { BaseService } from "./base.service";

@Injectable({ providedIn: 'root' })
export class ProductService extends BaseService {
  private apiService = inject(ApiService);
  private cartStore = inject(CartStore);

  // Cache for product data
  private productsCache = new Map<string, Product>();

  /**
   * Get products with filtering
   */
  getProducts(request: ProductQueryParams = {}): Observable<ProductListResponse> {
    this.logger.info('Fetching products', { request });
    return this.apiService.get<ProductListResponse>('products/list', {
      page: request.page || 1,
      pageSize: request.pageSize || 20,
      search: request.search,
      categories: request.categories,
      minPrice: request.minPrice,
      maxPrice: request.maxPrice,
      inStock: request.inStock,
      sortBy: request.sortBy
    });
  }

  /**
   * Get a single product by ID
   */
  getProduct(id: string): Observable<Product> {
    // Check cache first
    const cachedProduct = this.productsCache.get(id);
    if (cachedProduct) {
      this.logger.debug('Product retrieved from cache', { productId: id });
      return of(cachedProduct);
    }

    this.logger.info('Fetching product from API', { productId: id });
    return this.apiService.get<Product>('products/detail', { id }).pipe(
      tap(product => {
        // Cache the product
        this.productsCache.set(id, product);
      })
    );
  }

  /**
   * Get a product image URL
   */
  getProductImageUrl = computed<(product: Product) => string>(() => {
    return (product: Product) => {
      if (product.images && product.images.length > 0 && product.images[0].url) {
        return product.images[0].url;
      }

      // Deterministic fallback based on product ID
      const idNum = parseInt(product.id.replace(/\D/g, '') || '0', 10);
      const imageNum = (idNum % 29) + 1;
      return `assets/Pics/${imageNum}.webp`;
    };
  });

  /**
   * Add a product to cart
   */
  async addProductToCart(product: Product, quantity = 1): Promise<void> {
    if (product.stockLevel <= 0) {
      this.errorService.addError(
        'PRODUCT_OUT_OF_STOCK',
        'This product is currently out of stock',
        { severity: 'warning' }
      );
      return;
    }

    try {
      await this.cartStore.addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: this.getProductImageUrl()(product),
      });

      this.logger.info('Product added to cart', {
        productId: product.id,
        name: product.name,
        quantity
      });

      this.errorService.addError(
        'PRODUCT_ADDED',
        `Added ${quantity} ${product.name} to your cart`,
        { severity: 'info', timeout: 3000 }
      );
    } catch (error) {
      this.handleServiceError('Failed to add item to cart', error, 'cart');
      throw error;
    }
  }

  /**
   * Calculate product discount percentage
   */
  calculateDiscountPercentage(product: Product): number {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
      return 0;
    }

    return Math.round(
      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
    );
  }

  /**
   * Check if product is in stock
   */
  isInStock(product: Product): boolean {
    return product.stockLevel > 0;
  }

  /**
   * Check if product has low stock
   */
  hasLowStock(product: Product): boolean {
    return product.stockLevel > 0 && product.stockLevel <= 5;
  }

  /**
   * Get related products
   */
  getRelatedProducts(productId: string, categoryId?: string): Observable<Product[]> {
    this.logger.info('Fetching related products', { productId, categoryId });
    return this.apiService.get<ProductListResponse>('products/list', {
      categories: categoryId ? [categoryId] : undefined,
      excludeProduct: productId,
      pageSize: 6
    }).pipe(
      map(response => response.items)
    );
  }

  /**
   * Clear the product cache
   */
  clearCache(): void {
    this.productsCache.clear();
    this.logger.info('Product cache cleared');
  }
}