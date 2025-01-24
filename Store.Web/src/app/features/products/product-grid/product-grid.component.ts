import { Component, inject, signal } from '@angular/core';
import { ProductStore } from '../../../core/state/product.store';
import { QuickViewModalComponent } from '../../../core/components/product/quick-view-modal.component';
import { ProductCardComponent } from '../../../core/components/product/product-card.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [ProductCardComponent, QuickViewModalComponent],
  template: `
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      @for (product of products(); track product.id) {
        <app-product-card
          [product]="product"
          [loading]="isAddingToCart[product.id]"
          [inView]="true"
        />
      }

      @if (selectedProduct()) {
        <app-quick-view-modal
          [product]="selectedProduct()"
          [isOpen]="true"
        />
      }
    </div>

    @if (loading()) {
      <div class="col-span-full flex items-center justify-center py-12">
        <div class="flex items-center space-x-2">
          <svg class="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span class="text-lg text-muted-foreground">Loading products...</span>
        </div>
      </div>
    }
  `
})
export class ProductGridComponent {
  private productStore = inject(ProductStore);

  products = this.productStore.filteredProducts;
  loading = this.productStore.loading;
  isAddingToCart: Record<string, boolean> = {};
  selectedProduct = signal<unknown>(null);
}