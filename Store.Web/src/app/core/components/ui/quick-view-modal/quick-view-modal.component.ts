import { Component, input } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-quick-view-modal',
  standalone: true,
  imports: [ModalComponent],
  template: `
    <app-modal 
      [isOpen]="isOpen()" 
      [title]="product().name"
      [showFooter]="true"
      confirmText="Add to Cart"
      (close)="onClose()"
      (confirm)="onAddToCart()"
    >
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-2 gap-4">
          <!-- Product image -->
          <div class="aspect-square overflow-hidden rounded-md bg-muted">
            <img
              [src]="product().imageUrl"
              [alt]="product().name"
              class="h-full w-full object-cover"
            />
          </div>

          <!-- Product details -->
          <div class="space-y-2">
            <p class="text-2xl font-bold">{{ product().price | currency }}</p>
            
            @if (product().stockLevel > 0) {
              <p class="text-sm text-green-600">In Stock</p>
            } @else {
              <p class="text-sm text-red-600">Out of Stock</p>
            }

            <p class="text-sm text-muted-foreground">{{ product().description }}</p>

            <!-- Quantity selector -->
            <div class="flex items-center space-x-2">
              <label class="text-sm">Quantity:</label>
              <select 
                class="rounded-md border px-2 py-1 text-sm"
                [disabled]="product().stockLevel === 0"
              >
                @for (num of [1,2,3,4,5]; track num) {
                  <option [value]="num">{{ num }}</option>
                }
              </select>
            </div>
          </div>
        </div>
      </div>
    </app-modal>
  `
})
export class QuickViewModalComponent {
  product = input.required<any>();
  isOpen = input(false);

  onClose() {
    // Implement close logic
  }

  onAddToCart() {
    // Implement add to cart logic
  }
}