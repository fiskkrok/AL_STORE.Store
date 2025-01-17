import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SignalRService } from '../services/signalr.service';
import { ProductService } from '../services/product.service';
import { Product, ProductFilter } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductStore {
    private readonly products = signal<Product[]>([]);
    private readonly selectedProduct = signal<Product | null>(null);
    private readonly filters = signal<ProductFilter>({
        categoryId: '',
        minPrice: 0,
        maxPrice: 0
    });
    private readonly isLoading = signal(false);
    private readonly productService = inject(ProductService);

    readonly filteredProducts = computed(() => {
        const currentFilters = this.filters();
        return this.products().filter(product => {
            if (currentFilters.categoryId && product.categoryId !== currentFilters.categoryId) return false;
            if (currentFilters.minPrice && product.price < currentFilters.minPrice) return false;
            if (currentFilters.maxPrice && product.price > currentFilters.maxPrice) return false;
            if (currentFilters.inStock && product.stockLevel <= 0) return false;
            if (currentFilters.search) {
                const search = currentFilters.search.toLowerCase();
                return product.name.toLowerCase().includes(search) ||
                    product.description.toLowerCase().includes(search);
            }
            return true;
        });
    });
    // Add to existing state
    private readonly relatedProducts = signal<Product[]>([]);
    readonly currentProduct = computed(() => this.selectedProduct());
    readonly loading = computed(() => this.isLoading());

    constructor(private signalR: SignalRService) {
        // Subscribe to real-time product updates
        this.signalR.subscribeToProductUpdates(this.handleProductUpdate.bind(this));
    }

    async getProduct(id: string): Promise<Product | null> {
        this.isLoading.set(true);
        try {
            const product = await firstValueFrom(this.productService.getProduct(id));
            if (product) {
                this.selectedProduct.set(product);
                // Load related products if needed
                await this.loadRelatedProducts(product.id, product.categoryId);
                return product;
            }
            return null;
        } catch (error) {
            console.error('Error loading product:', error);
            return null;
        } finally {
            this.isLoading.set(false);
        }
    }

    private async loadRelatedProducts(productId: string, categoryId: string): Promise<void> {
        try {
            const related = await firstValueFrom(this.productService.getRelatedProducts(productId));
            // Handle related products...
            this.products.set(related);

        } catch (error) {
            console.error('Error loading related products:', error);
        }
    }

    async loadProducts(): Promise<void> {
        this.isLoading.set(true);
        try {
            const products = await firstValueFrom(this.productService.getProducts());
            this.products.set(products);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            this.isLoading.set(false);
        }
    }

    setFilters(newFilters: Partial<ProductFilter>): void {
        this.filters.update(current => ({ ...current, ...newFilters }));
    }

    private handleProductUpdate(update: any): void {
        this.products.update(products =>
            products.map(product =>
                product.id === update.productId
                    ? { ...product, ...update.changes }
                    : product
            )
        );
    }

    getRelatedProducts(productId: string): Product[] {
        return this.relatedProducts();
    }
}