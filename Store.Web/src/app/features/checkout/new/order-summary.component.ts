import { CommonModule, CurrencyPipe } from "@angular/common";
import { Component, inject, computed } from "@angular/core";
import { klarnaHelpers } from "../../../core/config/klarna.config";
import { CartStore } from "../../../core/state";

// order-summary.component.ts
@Component({
    selector: 'app-order-summary',
    standalone: true,
    imports: [CommonModule, CurrencyPipe],
    template: `
    <div class="bg-background rounded-lg border p-6">
      <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
      
      <!-- Cart Items -->
      <div class="space-y-4 mb-6">
        @for (item of cartItems(); track item.id) {
          <div class="flex items-center gap-4 py-4 border-b">
            <img [src]="item.imageUrl" [alt]="item.name" 
                 class="w-16 h-16 object-cover rounded">
            <div class="flex-1">
              <h3 class="font-medium">{{ item.name }}</h3>
              <p class="text-sm text-muted-foreground">
                Quantity: {{ item.quantity }}
              </p>
              <p class="font-medium">
                {{ item.price * item.quantity | currency:'SEK' }}
              </p>
            </div>
          </div>
        }
      </div>

      <!-- Totals -->
      <div class="space-y-2">
        <div class="flex justify-between">
          <span>Subtotal</span>
          <span>{{ subtotal() | currency:'SEK' }}</span>
        </div>
        <div class="flex justify-between">
          <span>VAT (25%)</span>
          <span>{{ tax() | currency:'SEK' }}</span>
        </div>
        <div class="flex justify-between font-bold pt-2 border-t">
          <span>Total</span>
          <span>{{ total() | currency:'SEK' }}</span>
        </div>
      </div>
    </div>
  `
})
export class OrderSummaryComponent {
    private readonly cartStore = inject(CartStore);

    cartItems = this.cartStore.cartItems;
    subtotal = this.cartStore.totalPrice;
    tax = computed(() => klarnaHelpers.calculateTax(this.subtotal()));
    total = computed(() => this.subtotal() + this.tax());
}