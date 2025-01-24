import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductStore } from '../../../core/state/product.store';
import { CartStore } from '../../../core/state/cart.store';
import { ErrorDisplayComponent } from "../../../core/components/error-display/error-display.component";
import { ErrorService } from '../../../core/services/error.service';
import { Product } from '../../../core/models/product.model';
import { ContainerComponent } from '../../../core/components/layout/container.component';
import { SectionComponent } from '../../../core/components/layout/section.component';
import { GridComponent } from '../../../core/components/layout/grid.component';
import { ProductCardComponent } from "../../../core/components/product/product-card.component";
import { QuickViewModalComponent } from "../../../core/components/product/quick-view-modal.component";

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ErrorDisplayComponent,
    ContainerComponent,
    SectionComponent,
    GridComponent,
    ProductCardComponent,
    QuickViewModalComponent
  ],
  template: `
    <app-error-display />
    <div class="page-container">
      <app-container>
        <app-section>
          <!-- Page Header -->
          <header class="mb-8 animate-in">
            <h1 class="h1 text-brand-navy dark:text-white">Our Products</h1>
            <p class="mt-2 text-lg text-brand-gray">
              Quality essentials for the modern man
            </p>
          </header>

          <!-- Filters & Search -->
          <div class="flex flex-col sm:flex-row gap-4 mb-8">
            <!-- Search -->
            <div class="flex-1">
              <input 
                #searchInput
                type="text" 
                placeholder="Search products..."
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
                (input)="onSearch(searchInput.value)"
                [disabled]="loading()"
              >
            </div>

            <!-- Category Filter -->
            <div class="w-full sm:w-48">
              <select 
                #categorySelect
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
                (change)="onCategoryChange(categorySelect.value)"
              >
                <option value="">All Categories</option>
                @for (category of categories(); track category.id) {
                  <option [value]="category.id">{{ category.name }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Loading State -->
          @if (loading()) {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              @for (item of [1,2,3,4,5,6,8]; track item) {
                <div class="rounded-lg border bg-card animate-pulse">
                  <div class="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <div class="p-4 space-y-3">
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              }
            </div>
          } 

          <!-- Product Grid -->
          @if (!loading()) {
            @if (products().length > 0) {
              <app-grid>
                @for (product of products(); track product.id) {
                  <app-product-card
                    [product]="product"
                    [loading]="false"
                    (handleQuickView)="selectedProduct = product"
                    (handleAddToCart)="addToCart(product)"
                  />
                }
              </app-grid>
            } @else {
              <div class="text-center py-12 bg-gray-50 rounded-lg">
                <svg 
                  class="mx-auto h-12 w-12 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            }
          }
        </app-section>
      </app-container>
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
export class ProductListComponent implements OnInit {
  private productStore = inject(ProductStore);
  private cartStore = inject(CartStore);
  private errorService = inject(ErrorService);
  products = this.productStore.filteredProducts;
  loading = this.productStore.loading;
  addingToCart: Record<string, boolean> = {};
  selectedProduct: Product | null = null;
  categories = signal([
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Clothing' },
    { id: '3', name: 'Home Goods' },
    { id: '4', name: 'Toys' },
    { id: '5', name: 'Books' },
    { id: '6', name: 'Health & Beauty' },
    { id: '7', name: 'Sports' }

  ]);

  // Set up effects for any side effects
  constructor() {
    effect(() => {
      // Example: Track when filters change
      console.log('Products updated:', this.products());
    });

  }
  ngOnInit(): void {
    this.loadProducts();
  }
  async loadProducts() {
    try {
      await this.productStore.loadProducts();
    } catch {
      this.errorService.addError({
        code: 'LOAD_ERROR',
        message: 'Failed to load products'
      });
    }
  }
  onSearch(term: string): void {
    this.productStore.setFilters({ search: term });
  }

  onCategoryChange(categoryId: string): void {
    this.productStore.setFilters({ categoryId });
  }

  async addToCart(product: Product): Promise<void> {
    this.addingToCart[product.id] = true;

    try {
      await this.cartStore.addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl
      });
    } catch {
      this.errorService.addError({
        code: 'CART_ERROR',
        message: 'Failed to add item to cart. Please try again.'
      });
    } finally {
      this.addingToCart[product.id] = false;
    }
  }
  closeQuickView() {
    this.selectedProduct = null;
  }
}
