// src/app/core/state/product.store.ts
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { SignalRService } from '../services/signalr.service';
import { ProductService } from '../services/product.service';
import { GetProductsRequest, Product, ProductListResponse } from '../models/product.model';
import { BaseStore } from './base.store';

interface ProductState {
    products: Product[];
    filteredProducts: Product[];
    categories: Category[];
    filters: GetProductsRequest;
    loading: boolean;
    error: string | null;
    selectedProduct: Product | null;
}

interface Category {
    id: string;
    name: string;
}

const initialState: ProductState = {
    products: [],
    filteredProducts: [],
    categories: [],
    filters: {
        page: 1,
        pageSize: 20,
        sortBy: 'newest'
    },
    loading: false,
    error: null,
    selectedProduct: null
};

@Injectable({ providedIn: 'root' })
export class ProductStore extends BaseStore {
    private productService = inject(ProductService);
    private signalR = inject(SignalRService);
    private state = signal<ProductState>(initialState);

    // Selectors
    products = signal<Product[]>([]);
    readonly categories = computed(() => this.state().categories);
    readonly selectedProduct = computed(() => this.state().selectedProduct);
    readonly filters = computed(() => this.state().filters);
    readonly filteredProducts = computed(() => this.state().filteredProducts);

    // Computed values
    readonly priceRange = computed(() => {
        const prices = this.state().products.map(p => p.price);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    });

    readonly availableCategories = computed(() => {
        const filtered = new Set(this.filteredProducts().map(p => p.categoryId));
        return this.state().categories.map(cat => ({
            ...cat,
            count: this.state().products.filter(p => p.categoryId === cat.id).length,
            disabled: !filtered.has(cat.id)
        }));
    });

    constructor() {
        super();
        this.setupRealtimeUpdates();
    }

    async loadProducts(): Promise<void> {
        this.setLoading(true);
        try {
            const response = await firstValueFrom(
                this.productService.getProducts(this.state().filters)
            );
            this.updateProducts(response);
        } catch (error) {
            this.setError(error instanceof Error ? error.message : 'Failed to load products');
        } finally {
            this.setLoading(false);
        }
    }

    setFilter(updates: Partial<GetProductsRequest>): void {
        this.state.update(s => ({
            ...s,
            filters: {
                ...s.filters,
                ...updates,
                page: updates.page || 1
            }
        }));
        this.loadProducts();
    }

    resetFilters(): void {
        this.state.update(s => ({
            ...s,
            filters: {
                page: 1,
                pageSize: 20,
                sortBy: 'newest'
            }
        }));
        this.loadProducts();
    }



    private updateProducts(response: ProductListResponse): void {
        this.state.update(s => ({
            ...s,
            products: response.items,
            filteredProducts: response.items,
            error: null
        }));
    }

    private setupRealtimeUpdates(): void {
        // Stock updates
        this.signalR.onStockUpdate?.pipe(
            takeUntilDestroyed(),
            debounceTime(100),
            distinctUntilChanged()
        )?.subscribe(update => {
            if (!update) return;
            this.state.update(s => ({
                ...s,
                products: s.products.map(p =>
                    p.id === update.productId
                        ? { ...p, stockLevel: update.newStockLevel }
                        : p
                )
            }));
        });

        // Price updates
        this.signalR.onPriceUpdate?.pipe(
            takeUntilDestroyed(),
            debounceTime(100),
            distinctUntilChanged()
        )?.subscribe(update => {
            if (!update) return;
            this.state.update(s => ({
                ...s,
                products: s.products.map(p =>
                    p.id === update.productId
                        ? { ...p, price: update.newPrice }
                        : p
                )
            }));
        });

    }
}