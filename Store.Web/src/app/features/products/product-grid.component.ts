import { CommonModule } from "@angular/common";
import { Component, input, output, computed } from "@angular/core";
import { ProductCardComponent } from "../../core/components/product/product-card.component";
import { CartItem } from "../../core/state";
import { Product } from "../../shared/models";

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div 
      class="grid gap-6" 
      [class]="gridClass()"
    >
      @if (loading()) {
        @for (i of placeholders(); track i) {
          <div class="animate-pulse">
            <div class="bg-muted aspect-square rounded-lg"></div>
            <div class="mt-4 space-y-3">
              <div class="h-4 bg-muted rounded w-3/4"></div>
              <div class="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        }
      } @else if (products().length > 0) {
        @for (product of products(); track trackByFn(product)) {
          <app-product-card
            [product]="product"
            [loading]="itemLoading[product.id] === true"
            [addingToCart]="addingToCart[product.id] === true"
            (handleQuickView)="onQuickView(product)"
            (handleAddToCart)="onAddToCart($event)"
          />
        }
      } @else {
        <div class="col-span-full flex items-center justify-center py-12 bg-gray-50 rounded-lg">
          <div class="text-center">
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
            @if (emptyMessage()) {
              <p class="mt-1 text-sm text-gray-500">{{ emptyMessage() }}</p>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class ProductGridComponent {
  products = input.required<Product[]>({});
  loading = input(false);
  emptyMessage = input<string>('');
  columns = input<1 | 2 | 3 | 4>(4);
  limit = input<number | null>(null);

  itemLoading: Record<string, boolean> = {};
  addingToCart: Record<string, boolean> = {};

  // Events
  quickView = output<Product>();
  addToCart = output<CartItem>();

  placeholders = computed(() => {
    const count = this.limit() ?? this.columns() * 2;
    return Array.from({ length: count }, (_, i) => i);
  });

  gridClass = computed(() => {
    const cols = this.columns();
    switch (cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  });

  trackByFn(product: Product): string {
    return product.id;
  }

  onQuickView(product: Product): void {
    this.quickView.emit(product);
  }

  async onAddToCart(item: CartItem): Promise<void> {
    const productId = item.productId;
    this.addingToCart[productId] = true;

    try {
      this.addToCart.emit(item);
    } finally {
      // Add small delay for better UX
      setTimeout(() => {
        this.addingToCart[productId] = false;
      }, 500);
    }
  }
}