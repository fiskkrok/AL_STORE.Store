// src/app/features/products/components/product-grid/product-grid.component.ts
import { Component, inject, signal } from '@angular/core';
import { ProductCardComponent } from '../../core/components/product/product-card.component';
import { QuickViewModalComponent } from '../../core/components/product/quick-view-modal.component';
import { Product } from '../../core/models/product.model';
import { CartStore, CartItem } from '../../core/state/cart.store';
import { ProductStore } from '../../core/state/product.store';
import { IntersectionObserverDirective } from '../../directives/intersection-observer.directive';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [
    ProductCardComponent,
    QuickViewModalComponent,
    IntersectionObserverDirective,
  ],
  template: `
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      @for (product of products(); track product.id) {
        <app-product-card
          [product]="product"
          [loading]="isAddingToCart[product.id]"
          appIntersectionObserver
          (intersecting)="onIntersecting($event, product)"
          (handleQuickView)="selectedProduct.set(product)"
          (handleAddToCart)="onAddToCart($event)"
        />
      }

      @if (selectedProduct() !== null) {
        <app-quick-view-modal
          [product]="selectedProduct()!"
          [isOpen]="true"
          (close)="selectedProduct.set(null)"
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

    @if (!loading() && products().length === 0) {
      <div class="col-span-full flex items-center justify-center py-12">
        <div class="text-center">
          <svg 
            class="mx-auto h-12 w-12 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium">No products found</h3>
          <p class="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or search term.
          </p>
        </div>
      </div>
    }
  `
})
export class ProductGridComponent {
  private readonly productStore = inject(ProductStore);
  private readonly cartStore = inject(CartStore);
  products = this.productStore.products;
  loading = this.productStore.loading;
  isAddingToCart: Record<string, boolean> = {};
  selectedProduct = signal<Product | null>(null);

  onIntersecting(isIntersecting: boolean, product: Product): void {
    if (isIntersecting) {
      // Could be used for analytics or lazy loading
      console.log('Product in view:', product.id);
    }
  }

  async onAddToCart(event: CartItem): Promise<void> {
    const productId = event.productId;
    this.isAddingToCart[productId] = true;

    try {
      // Handle add to cart logic
      await this.cartStore.addItem(event);
    } finally {
      this.isAddingToCart[productId] = false;
    }
  }
}