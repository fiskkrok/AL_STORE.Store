// src/app/core/state/product.store.ts
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { SignalRService } from '../services/signalr.service';
import { ProductService } from '../services/product.service';
import { GetProductsRequest, Product, ProductListRequest, ProductListResponse } from '../models/product.model';


interface ProductState {
    products: Product[];
    total: number;
    currentPage: number;
    pageSize: number;
    loading: boolean;
    error: string | null;
    filters: ProductListRequest;
}

const initialState: ProductState = {
    products: [],
    total: 0,
    currentPage: 1,
    pageSize: 20,
    loading: false,
    error: null,
    filters: {}
};

@Injectable({ providedIn: 'root' })
export class ProductStore {
    private productService = inject(ProductService);
    private signalR = inject(SignalRService);
    private state = signal<ProductState>(initialState);

    // Selectors
    readonly products = computed(() => this.state().products);
    readonly loading = computed(() => this.state().loading);
    readonly error = computed(() => this.state().error);
    readonly currentPage = computed(() => this.state().currentPage);
    readonly totalPages = computed(() =>
        Math.ceil(this.state().total / this.state().pageSize)
    );

    // Computed values
    readonly priceRange = computed(() => {
        const prices = this.state().products.map(p => p.price);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    });

    async loadProducts(request: ProductListRequest = {}): Promise<void> {
        this.state.update(s => ({ ...s, loading: true, error: null }));

        try {
            const response = await firstValueFrom(
                this.productService.getProducts({
                    ...this.state().filters,
                    ...request
                })
            );

            this.state.update(s => ({
                ...s,
                products: response.items,
                total: response.total,
                currentPage: response.page,
                pageSize: response.pageSize,
                loading: false
            }));
        } catch (error) {
            this.state.update(s => ({
                ...s,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to load products'
            }));
        }
    }

    setFilter(updates: Partial<ProductListRequest>): void {
        this.state.update(s => ({
            ...s,
            filters: {
                ...s.filters,
                ...updates
            },
            currentPage: 1 // Reset to first page when filters change
        }));

        this.loadProducts();
    }

    goToPage(page: number): void {
        if (page === this.state().currentPage) return;

        this.loadProducts({
            ...this.state().filters,
            page
        });
    }
}