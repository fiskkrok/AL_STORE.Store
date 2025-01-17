import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductStore } from '../../../core/state/product.store';
import { CartStore } from '../../../core/state/cart.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { ErrorDisplayComponent } from "../../../core/components/error-display/error-display.component";
import { LoadingSpinnerComponent } from "../../../core/components/loading-spinner/loading-spinner.component";
import { ErrorService } from '../../../core/services/error.service';
import { Product } from '../../../core/models/product.model';
import { ContainerComponent } from '../../../core/components/layout/container.component';
import { SectionComponent } from '../../../core/components/layout/section.component';
import { GridComponent } from '../../../core/components/layout/grid.component';
import { ProductCardComponent } from "../../../core/components/product/product-card.component";

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ErrorDisplayComponent, LoadingSpinnerComponent, ContainerComponent, SectionComponent, GridComponent, ProductCardComponent],
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

      <app-grid>
        @for (product of products(); track product.id) {
          <app-product-card
            [product]="product"
            [loading]="loading()"
            (onQuickView)="selectedProduct = product"
            (onAddToCart)="addToCart($event)"
          />
        }
      </app-grid>
        
        @if (!loading() && products().length === 0) {
          <div class="col-span-full text-center p-8 bg-gray-50 rounded">
            <p class="text-gray-600">No products found.</p>
          </div>
        }
      </div>
      </app-section>
      </app-container>
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
