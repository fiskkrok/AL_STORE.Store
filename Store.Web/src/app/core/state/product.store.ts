import { Injectable, computed, signal } from '@angular/core';
import { SignalRService } from '../services/signalr.service';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stockLevel: number;
    imageUrl: string;
    categoryId: string;
}

interface ProductFilters {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductStore {
    private readonly products = signal<Product[]>([]);
    private readonly filters = signal<ProductFilters>({});
    private readonly isLoading = signal(false);

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

    readonly loading = computed(() => this.isLoading());

    constructor(private signalR: SignalRService) {
        // Subscribe to real-time product updates
        this.signalR.subscribeToProductUpdates(this.handleProductUpdate.bind(this));
    }

    setFilters(newFilters: Partial<ProductFilters>): void {
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
}