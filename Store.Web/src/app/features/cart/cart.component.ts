import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../core/state/cart.store';
import { animate, style, transition, trigger } from '@angular/animations';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  providers: [CurrencyPipe],
  animations: [
    trigger('itemAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ])
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-8">Your Cart</h1>

      @if (cartItems().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Cart Items -->
          <div class="md:col-span-2 space-y-4">
            @for (item of cartItems(); track item.id) {
              <div 
                class="flex items-center space-x-4 border rounded-lg p-4 bg-card"
                [@itemAnimation]
              >
                <img 
                  [src]="item.imageUrl" 
                  [alt]="item.name"
                  class="w-20 h-20 object-cover rounded"
                />
                
                <div class="flex-1">
                  <h3 class="font-medium">{{ item.name }}</h3>
                  <p class="text-sm text-muted-foreground">{{ item.price | currency }}</p>
                </div>

                <div class="flex items-center space-x-2">
                  <button 
                    class="p-1 hover:bg-accent rounded"
                    (click)="updateQuantity(item, -1)"
                    [disabled]="item.quantity <= 1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                  </button>
                  
                  <span class="w-8 text-center">{{ item.quantity }}</span>
                  
                  <button 
                    class="p-1 hover:bg-accent rounded"
                    (click)="updateQuantity(item, 1)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                </div>

                <button 
                  class="p-2 hover:bg-destructive hover:text-destructive-foreground rounded"
                  (click)="removeItem(item)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            }
          </div>

          <!-- Order Summary -->
          <div class="space-y-6">
            <div class="border rounded-lg p-6 bg-card">
              <h2 class="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Subtotal</span>
                  <span>{{ totalPrice() | currency }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Shipping</span>
                  <span>{{ getFormattedShipping() }}</span>
                </div>
                <div class="border-t pt-2 mt-2">
                  <div class="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{{ getFormattedTotalPrice() }}</span>
                  </div>
                </div>
              </div>

              <button 
                class="w-full mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                routerLink="/checkout"
              >
                Proceed to Checkout
              </button>
            </div>

            <div class="text-sm text-muted-foreground">
              <p class="mb-2">Secure Checkout</p>
              <div class="flex space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                <span>All major credit cards accepted</span>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-12">
          <div class="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-muted-foreground"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <h2 class="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p class="text-muted-foreground mb-4">Looks like you haven't added anything to your cart yet</p>
          <a 
            routerLink="/products" 
            class="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  private readonly cartStore = inject(CartStore);
  private readonly currencyPipe = inject(CurrencyPipe);

  cartItems = this.cartStore.cartItems;
  totalPrice = this.cartStore.totalPrice;
  shipping = 5.99;

  async updateQuantity(item: { id: string; quantity: number; name: string; price: number; imageUrl: string }, change: number) {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      await this.cartStore.updateQuantity(item.id, newQuantity);
    }
  }

  async removeItem(item: { id: string; quantity: number; name: string; price: number; imageUrl: string }) {
    await this.cartStore.removeItem(item.id);
  }

  getFormattedTotalPrice() {
    return this.currencyPipe.transform(this.totalPrice() + this.shipping, 'USD');
  }

  getFormattedShipping() {
    return this.currencyPipe.transform(this.shipping, 'USD');
  }
}
