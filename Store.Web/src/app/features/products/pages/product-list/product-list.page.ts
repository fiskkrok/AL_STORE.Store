// src/app/features/products/pages/product-list/product-list.page.ts
// imports

import { CommonModule } from "@angular/common";
import { Component, inject, computed, OnInit } from "@angular/core";
import { ErrorDisplayComponent } from "../../../../core/components/error-display.component";
import { ErrorService } from "../../../../core/services/error.service";
import { ProductStore, CartStore, CartItem } from "../../../../core/state";
import { Product } from "../../../../shared/models";
import { ProductFiltersComponent } from "../../product-filters.component";
import { ProductGridComponent } from "../../product-grid.component";
import { ProductSearchComponent } from "../../product-search.component";
import { QuickViewModalComponent } from "../../../../core/components/product/quick-view-modal.component";

@Component({
  selector: "app-product-list-page",
  standalone: true,
  imports: [
    CommonModule,
    ProductGridComponent,
    ProductFiltersComponent,
    ProductSearchComponent,
    ErrorDisplayComponent,
    QuickViewModalComponent
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

            <!-- Search (Desktop) -->
            <div class="hidden md:block">
              <app-product-search />
            </div>
          </div>
        </div>
      </header>

      <div class="container py-6 md:py-8">
        <div class="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <!-- Filters -->
          <aside class="lg:block" 
            [class.hidden]="!showMobileFilters"
            [class.fixed]="showMobileFilters"
            [class.inset-0]="showMobileFilters"
            [class.z-50]="showMobileFilters"
            [class.bg-background]="showMobileFilters"
            [class.backdrop-blur-sm]="showMobileFilters">
            
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
            @if (error()) {
              <app-error-display />
            } @else {
              <app-product-grid
                [products]="products()"
                [loading]="loading()"
                [emptyMessage]="'Try adjusting your search or filter to find what you are looking for.'"
                (quickView)="selectedProduct = $event"
                (addToCart)="addToCart($event)"
              />
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Quick View Modal -->
    @if (selectedProduct) {
      <app-quick-view-modal
        [product]="selectedProduct"
        [isOpen]="true"
        (close)="selectedProduct = null"
      />
    }
  `
})
export class ProductListPageComponent implements OnInit {
  // Services
  private readonly productStore = inject(ProductStore);
  private readonly cartStore = inject(CartStore);
  private readonly errorService = inject(ErrorService);

  // Store computed values
  products = this.productStore.products;
  loading = this.productStore.loading;
  error = this.productStore.error;
  totalProducts = computed(() => this.productStore.products().length);

  // UI state
  showMobileFilters = false;
  selectedProduct: Product | null = null;

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    try {
      await this.productStore.loadProducts();
    } catch {
      this.errorService.addError(
        'LOAD_ERROR',
        'Failed to load products'
      );
    }
  }

  async addToCart(cartItem: CartItem): Promise<void> {
    try {
      await this.cartStore.addItem(cartItem);
    } catch {
      this.errorService.addError(
        'CART_ERROR',
        'Failed to add item to cart. Please try again.'
      );
    }
  }
}