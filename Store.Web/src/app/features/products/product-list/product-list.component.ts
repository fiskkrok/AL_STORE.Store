import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductStore } from '../../../core/state/product.store';
import { CartStore } from '../../../core/state/cart.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { ErrorDisplayComponent } from "../../../core/components/error-display/error-display.component";
import { LoadingSpinnerComponent } from "../../../core/components/loading-spinner/loading-spinner.component";
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ErrorDisplayComponent, LoadingSpinnerComponent],
  template: `
   <app-error-display />

    <div class="container mx-auto p-4">
      <!-- Filters -->
      <div class="mb-4">
        <input 
          #searchInput
          type="text" 
          placeholder="Search products..."
          class="px-4 py-2 border rounded"
          (input)="onSearch(searchInput.value)"
           [disabled]="loading()"
        >
        
        <select 
          #categorySelect
          class="ml-2 px-4 py-2 border rounded"
          (change)="onCategoryChange(categorySelect.value)"
        >
          <option value="">All Categories</option>
          @for (category of categories(); track category.id) {
            <option [value]="category.id">{{ category.name }}</option>
          }
        </select>
      </div>

      <!-- Product Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        @for (product of products(); track product.id) {
          <div class="relative border rounded-lg p-4 hover:shadow-lg transition">
            @if (addingToCart[product.id]) {
              <div class="absolute inset-0 bg-white/80 flex items-center justify-center">
                <app-loading-spinner message="Adding to cart..." />
              </div>
            }
            
            <img [src]="product.imageUrl" [alt]="product.name" class="w-full h-48 object-cover">
            <h3 class="text-lg font-semibold mt-2">{{ product.name }}</h3>
            <p class="text-gray-600">{{ product.price | currency }}</p>
            <button 
              class="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              (click)="addToCart(product)"
              [disabled]="product.stockLevel === 0 || addingToCart[product.id]"
            >
              @if (product.stockLevel > 0) {
                Add to Cart
              } @else {
                Out of Stock
              }
            </button>
          </div>
        }
        
        @if (!loading() && products().length === 0) {
          <div class="col-span-full text-center p-8 bg-gray-50 rounded">
            <p class="text-gray-600">No products found.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ProductListComponent {
  private productStore = inject(ProductStore);
  private cartStore = inject(CartStore);
  private errorService = inject(ErrorService);
  products = this.productStore.filteredProducts;
  loading = this.productStore.loading;
  addingToCart: Record<string, boolean> = {};

  categories = signal([
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Clothing' },
    // ... more categories
  ]);

  // Set up effects for any side effects
  constructor() {
    effect(() => {
      // Example: Track when filters change
      console.log('Products updated:', this.products());
    });
  }

  onSearch(term: string): void {
    this.productStore.setFilters({ search: term });
  }

  onCategoryChange(categoryId: string): void {
    this.productStore.setFilters({ categoryId });
  }

  async addToCart(product: any): Promise<void> {
    this.addingToCart[product.id] = true;

    try {
      await this.cartStore.addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl
      });
    } catch (error) {
      this.errorService.addError({
        code: 'CART_ERROR',
        message: 'Failed to add item to cart. Please try again.'
      });
    } finally {
      this.addingToCart[product.id] = false;
    }
  }
}

