// src/app/features/products/pages/product-list/product-list.page.ts
import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDisplayComponent } from '../../../../core/components/error-display/error-display.component';
import { ProductStore } from '../../../../core/state/product.store';
import { ProductGridComponent } from '../../product-grid.component';
import { ProductFiltersComponent } from '../../product-filters.component';
import { ProductSearchComponent } from '../../product-search.component';



@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductGridComponent,
    ProductFiltersComponent,
    ProductSearchComponent,
    ErrorDisplayComponent
  ],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <header class="border-b bg-card">
        <div class="container py-4">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 class="text-2xl text-foreground font-bold tracking-tight">Products</h1>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ totalProducts() }} products available
              </p>
            </div>

            <!-- Mobile Filters Toggle -->
            <button 
              class="md:hidden flex items-center gap-2 text-sm"
              (click)="showMobileFilters = !showMobileFilters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M7 12h10m-14 6h18"/>
              </svg>
              Filters
            </button>

            <!-- Sort (Desktop) -->
            <div class="hidden md:block">
              <app-product-search />
            </div>
          </div>
        </div>
      </header>

      <div class="container py-6 md:py-8">
        <div class="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <!-- Filters -->
          <!-- Mobile Header -->
          <aside class="lg:block" 
            [class.hidden]="!showMobileFilters"
            [class.fixed]="showMobileFilters"
            [class.inset-0]="showMobileFilters"
            [class.z-50]="showMobileFilters"
            [class.bg-background]="showMobileFilters"
            [class.backdrop-blur-sm]="showMobileFilters" >
            @if (showMobileFilters) {
              <div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
                <div class="fixed inset-y-0 left-0 w-full max-w-xs bg-background p-6 shadow-lg">
                  <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-semibold">Filters</h2>
                    <button 
                      class="text-muted-foreground hover:text-foreground"
                      (click)="showMobileFilters = false"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                           fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  <app-product-filters />
                </div>
              </div>
            }
            
            <!-- Desktop Filters -->
            <div class="hidden lg:block sticky top-4">
              <app-product-filters />
            </div>
          </aside>

          <!-- Content -->
          <div class="mt-6 lg:mt-0">
            @if (loading()) {
              <div class="animate-pulse space-y-4">
                @for (i of [1,2,3,4]; track i) {
                  <div class="h-64 bg-muted rounded-lg"></div>
                }
              </div>
            } @else if (error()) {
              <app-error-display />
            } @else {
              <app-product-grid />
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductListPageComponent {
  private store = inject(ProductStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  totalProducts = computed(() => this.store.products().length);

  // UI State
  showMobileFilters = false;

  // Store Selectors
  loading = this.store.loading;
  error = this.store.error;
  // totalProducts = computed(() => this.store.filteredProducts().length);

  constructor() {
    // Handle route parameters
    effect(() => {
      const params = this.route.snapshot.queryParams;

      if (params['category']) {
        this.store.setFilter({ categories: [params['category']] });
      }
      if (params['search']) {
        this.store.setFilter({ search: params['search'] });
      }
      if (params['sort']) {
        this.store.setFilter({ sortBy: params['sort'] });
      }
    });

    // Sync URL with filters
    // effect(() => {
    //   const filters = this.store.filters();
    //   const queryParams: Record<string, string> = {};

    //   if (filters.categories?.length) {
    //     queryParams['category'] = filters.categories[0];
    //   }
    //   if (filters.search) {
    //     queryParams['search'] = filters.search;
    //   }
    //   if (filters.sortBy && filters.sortBy !== 'featured' as 'price_asc' | 'price_desc' | 'newest' | 'featured') {
    //     queryParams['sort'] = filters.sortBy;
    //   }

    //   this.router.navigate([], {
    //     relativeTo: this.route,
    //     queryParams,
    //     replaceUrl: true
    //   });
    // });

    // Load initial data
    this.store.loadProducts();
  }
}