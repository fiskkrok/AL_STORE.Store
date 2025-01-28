/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/core/state/product.store.ts
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { SignalRService } from '../services/signalr.service';
import { ProductService } from '../services/product.service';
import { Product, ProductFilter } from '../models/product.model';

// export interface ProductFilter {
//     search: string;
//     categoryIds: string[];
//     priceRange: {
//         min: number;
//         max: number;
//     };
//     sizes: string[];
//     inStock: boolean;
//     sortBy: 'featured' | 'price_asc' | 'price_desc' | 'newest';
// }

interface ProductState {
    products: Product[];
    categories: Category[];
    filters: ProductFilter;
    loading: boolean;
    error: string;
    selectedProduct: Product | null;
}
interface Category {
    id: string;
    name: string;
}
const initialFilters: ProductFilter = {
    search: '',
    categoryIds: [],
    priceRange: { min: 0, max: 0 },
    sizes: [],
    inStock: false,
    sortBy: 'featured'
};

@Injectable({ providedIn: 'root' })
export class ProductStore {
    setSearchQuery(arg0: string) {
        throw new Error('Method not implemented.');
    }
    updateFilters(values: Partial<{ minPrice: null; maxPrice: null; inStock: boolean | null; sortBy: string | null; }>) {
        throw new Error('Method not implemented.');
    }
    setCategory(arg0: string[] | null) {
        throw new Error('Method not implemented.');
    }
    // Dependencies
    private productService = inject(ProductService);
    private signalR = inject(SignalRService);

    // State
    private state = signal<ProductState>({
        products: [],
        categories: [],
        filters: initialFilters,
        loading: false,
        error: '',
        selectedProduct: null
    });

    // Selectors
    readonly products = computed(() => this.state().products);
    readonly loading = computed(() => this.state().loading);
    readonly error = computed(() => this.state().error);
    readonly categories = computed(() => this.state().categories);
    readonly selectedProduct = computed(() => this.state().selectedProduct);
    readonly filters = computed(() => this.state().filters);

    // Computed Values
    readonly filteredProducts = computed(() => {
        const { products, filters } = this.state();

        return products.filter(product => {
            // Search filter
            if (filters.search && !this.matchesSearch(product, filters.search)) {
                return false;
            }

            // Category filter
            if (filters.categoryIds.length && !filters.categoryIds.includes(product.categoryId)) {
                return false;
            }

            // Price filter
            if (filters.priceRange.min > 0 && product.price < filters.priceRange.min) {
                return false;
            }
            if (filters.priceRange.max > 0 && product.price > filters.priceRange.max) {
                return false;
            }

            // Size filter
            if (filters.sizes.length && !this.matchesSizes(product, filters.sizes)) {
                return false;
            }

            // Stock filter
            if (filters.inStock && product.stockLevel <= 0) {
                return false;
            }

            return true;
        }).sort((a, b) => this.sortProducts(a, b, filters.sortBy));
    });

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
        // Subscribe to real-time updates
        this.setupRealtimeUpdates();

        // Load initial data
        this.loadInitialData();

        // Setup effects
        effect(() => {
            console.log('Filtered products updated:', this.filteredProducts().length);
        });
    }

    // Actions
    async loadProducts(): Promise<void> {
        this.setLoading(true);
        try {
            const products = await firstValueFrom(this.productService.getProducts());
            this.updateProducts(products);
        } catch {
            this.setError('Failed to load products');
        } finally {
            this.setLoading(false);
        }
    }

    async getProduct(id: string): Promise<Product | null> {
        try {
            const product = await firstValueFrom(this.productService.getProduct(id));
            if (product) {
                this.state.update(s => ({
                    ...s,
                    selectedProduct: product
                }));
            }
            return product;
        } catch {
            this.setError('Failed to load product details');
            return null;
        }
    }

    setFilter(updates: Partial<ProductFilter>): void {
        this.state.update(s => ({
            ...s,
            filters: {
                ...s.filters,
                ...updates
            }
        }));
    }

    resetFilters(): void {
        this.state.update(s => ({
            ...s,
            filters: initialFilters
        }));
    }

    filter() {
        return this.filters();
    }

    // Private helpers
    private setLoading(loading: boolean): void {
        this.state.update(s => ({ ...s, loading }));
    }

    private setError(error: string): void {
        this.state.update(s => ({ ...s, error }));
    }

    private updateProducts(products: Product[]): void {
        this.state.update(s => ({ ...s, products }));
    }

    private matchesSearch(product: Product, search: string): boolean {
        const searchLower = search.toLowerCase();
        return (
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
        );
    }

    private matchesSizes(product: Product, sizes: string[]): boolean {
        return product.variants?.some((v: { name: string; }) =>
            sizes.some(size => v.name.toLowerCase().includes(size.toLowerCase()))
        ) ?? false;
    }

    private sortProducts(a: Product, b: Product, sortBy: ProductFilter['sortBy']): number {
        switch (sortBy) {
            case 'price_asc':
                return a.price - b.price;
            case 'price_desc':
                return b.price - a.price;
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            default:
                return 0;
        }
    }

    private setupRealtimeUpdates(): void {
        this.signalR.onStockUpdate.pipe(
            takeUntilDestroyed(),
            debounceTime(100),
            distinctUntilChanged()
        ).subscribe((update: { productId: string; newStockLevel: any; }) => {
            this.state.update(s => ({
                ...s,
                products: s.products.map(p =>
                    p.id === update.productId
                        ? { ...p, stockLevel: update.newStockLevel }
                        : p
                )
            }));
        });
    }

    private async loadInitialData(): Promise<void> {
        await Promise.all([
            this.loadProducts(),
            this.loadCategories()
        ]);
    }

    private async loadCategories(): Promise<void> {
        try {
            const categories = await firstValueFrom(this.productService.getCategories()) as Category[];
            this.state.update(s => ({ ...s, categories }));
        } catch {
            this.setError('Failed to load categories');
        }
    }
}