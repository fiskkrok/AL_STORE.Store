// src/app/core/components/cart/cart-dropdown.component.ts
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { fadeAnimation } from '../../animations/fade.animation/fade.animation';
import { CartStore } from '../../state/cart.store';


@Component({
  selector: 'app-cart-dropdown',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  animations: [fadeAnimation],
  template: `
    @if (isOpen()) {
      <div 
        class="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[28rem] rounded-lg border bg-white shadow-lg"
        [@fade]
        style="max-width: calc(100vw - 2rem);"
      >
        @if (recentlyAdded()) {
          <div class="p-3 sm:p-4 border-b bg-green-50">
            <div class="flex items-center gap-3 sm:gap-4">
              <img 
                [src]="recentlyAdded()?.imageUrl" 
                [alt]="recentlyAdded()?.name"
                class="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded"
              />
              <div class="min-w-0 flex-1">
                <p class="font-medium text-green-600 text-sm sm:text-base">Added to Cart!</p>
                <p class="text-sm truncate">{{ recentlyAdded()?.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ recentlyAdded()?.quantity }} × {{ recentlyAdded()?.price | currency }}
                </p>
              </div>
            </div>
          </div>
        }

        @if (cartItems().length > 0) {
          <div class="max-h-[60vh] sm:max-h-96 overflow-auto">
            @for (item of cartItems(); track item.id) {
              <div class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50">
                <img 
                  [src]="item.imageUrl" 
                  [alt]="item.name"
                  class="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded"
                />
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-sm sm:text-base truncate">{{ item.name }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ item.quantity }} × {{ item.price | currency }}
                  </p>
                </div>
              </div>
            }
          </div>

          <div class="border-t p-3 sm:p-4">
            <div class="flex justify-between mb-3 sm:mb-4">
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
          <div class="p-6 sm:p-8 text-center">
            <p class="text-muted-foreground">Your cart is empty</p>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      position: absolute;
      right: 1rem;
      left: 1rem;
      @media (min-width: 640px) {
        left: auto;
        width: 28rem;
      }
    }
  `]
})
export class CartDropdownComponent {
  private cartStore = inject(CartStore);

  isOpen = input(false);
  cartItems = this.cartStore.cartItems;
  totalItems = this.cartStore.totalItems;
  totalPrice = this.cartStore.totalPrice;
  recentlyAdded = this.cartStore.recentlyAddedItem;
}