// src/app/core/components/cart/cart-dropdown.component.ts
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { fadeAnimation } from '../../../core/animations/fade.animation/fade.animation';
import { CartStore } from '../../../core/state/cart.store';


@Component({
  selector: 'app-cart-dropdown',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  animations: [fadeAnimation],
  template: `
    @if (isOpen()) {
      <div 
        class="absolute right-0 mt-2 w-96 rounded-lg border bg-background shadow-lg"
        [@fade]
      >
        @if (recentlyAdded()) {
          <div class="p-4 border-b bg-accent/20">
            <div class="flex items-center gap-4">
              <img 
                [src]="recentlyAdded()?.imageUrl" 
                [alt]="recentlyAdded()?.name"
                class="w-16 h-16 object-cover rounded"
              />
              <div>
                <p class="font-medium text-green-600">Added to Cart!</p>
                <p class="text-sm">{{ recentlyAdded()?.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ recentlyAdded()?.quantity }} × {{ recentlyAdded()?.price | currency }}
                </p>
              </div>
            </div>
          </div>
        }

        @if (cartItems().length > 0) {
          <div class="max-h-96 overflow-auto">
            @for (item of cartItems(); track item.id) {
              <div class="flex items-center gap-4 p-4 hover:bg-accent/50">
                <img 
                  [src]="item.imageUrl" 
                  [alt]="item.name"
                  class="w-16 h-16 object-cover rounded"
                />
                <div class="flex-1">
                  <p class="font-medium">{{ item.name }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ item.quantity }} × {{ item.price | currency }}
                  </p>
                </div>
              </div>
            }
          </div>

          <div class="border-t p-4">
            <div class="flex justify-between mb-4">
              <span class="font-medium">Subtotal</span>
              <span class="font-medium">{{ totalPrice() | currency }}</span>
            </div>

            <div class="space-y-2">
              <a 
                routerLink="/cart"
                class="block w-full px-4 py-2 text-center text-sm bg-brand-navy text-white rounded-md hover:bg-opacity-90 transition"
              >
                View Cart ({{ totalItems() }} items)
              </a>
              <a 
                routerLink="/checkout"
                class="block w-full px-4 py-2 text-center text-sm border border-brand-navy text-brand-navy rounded-md hover:bg-brand-navy hover:text-white transition"
              >
                Proceed to Checkout
              </a>
            </div>
          </div>
        } @else {
          <div class="p-8 text-center">
            <p class="text-muted-foreground">Your cart is empty</p>
          </div>
        }
      </div>
    }
  `
})
export class CartDropdownComponent {
  private cartStore = inject(CartStore);

  isOpen = input(false);
  cartItems = this.cartStore.cartItems;
  totalItems = this.cartStore.totalItems;
  totalPrice = this.cartStore.totalPrice;
  recentlyAdded = this.cartStore.recentlyAddedItem;
}