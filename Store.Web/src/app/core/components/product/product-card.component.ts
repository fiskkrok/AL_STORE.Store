// src/app/core/components/product/product-card.component.ts
import { Component, inject, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { IntersectionObserverDirective } from '../../../directives/intersection-observer.directive';
import { CartItem, CartStore } from '../../state/cart.store';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, IntersectionObserverDirective, RouterLink, CurrencyPipe],
  providers: [CurrencyPipe],
  template: `
    <div
      class="group relative rounded-lg border bg-card overflow-hidden hover-lift press-effect"
      [class.opacity-75]="loading()"
    >
      <!-- Image Container -->
      <div class="relative aspect-square overflow-hidden bg-gray-100">
        @if (!loading()) {
          <img
            [src]="product().images[0].url"
            [alt]="product().name"
            class="object-cover w-full h-full transition duration-300 group-hover:scale-105"
            loading="lazy"
          />

          <!-- Quick Actions -->
          <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div class="flex gap-2 translate-y-4 transition-transform group-hover:translate-y-0">
              <button
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-100 transition"
                (click)="onQuickView.emit(product())"
              >
                Quick View
              </button>
              @if (product().stockLevel > 0) {
                <button
                  class="px-4 py-2 bg-brand-navy text-white rounded-md hover:bg-opacity-90 transition"
                  (click)="addToCart()"
                  [disabled]="loading() || isAddingToCart"
                >
                  @if (isAddingToCart) {
                    Adding...
                  } @else {
                    Add to Cart
                  }
                </button>
              }
            </div>
          </div>

          <!-- Tags -->
          @if (product().compareAtPrice) {
            <span class="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-red-500 text-white rounded">
              SALE
            </span>
          }
        } @else {
          <div class="absolute inset-0 loading-shimmer"></div>
        }
      </div>

      <!-- Product Info -->
      <div class="p-4">
        @if (!loading()) {
          <div class="min-h-[6rem]">
            <h3 class="font-medium text-base">
              <a
                [routerLink]="['/products', product().id]"
                class="hover:text-brand-navy transition"
              >
                {{ product().name }}
              </a>
            </h3>

            <p class="mt-1 text-sm text-muted-foreground line-clamp-2">
              {{ product().description }}
            </p>
          </div>

          <div class="mt-2 flex items-center justify-between">
            <div class="flex items-baseline gap-2">
              <span class="text-lg font-semibold">
                {{ product().price | currency }}
              </span>
              @if (product().compareAtPrice) {
                <span class="text-sm text-muted-foreground line-through">
                  {{ product().compareAtPrice | currency }}
                </span>
              }
            </div>

            <!-- Stock Status -->
            @if (product().stockLevel <= 0) {
              <span class="text-sm text-red-500">Out of Stock</span>
            } @else if (product().stockLevel < 5) {
              <span class="text-sm text-amber-500">Low Stock</span>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class ProductCardComponent {
  private cartStore = inject(CartStore);
  private errorService = inject(ErrorService);

  product = input.required<Product>();
  loading = input(false);

  onQuickView = output<Product>();
  onAddToCart = output<CartItem>();

  isAddingToCart = false;
  async addToCart() {
    if (this.isAddingToCart) return;

    this.isAddingToCart = true;
    try {
      const addedItem = await this.cartStore.addItem({
        productId: this.product().id,
        name: this.product().name,
        price: this.product().price,
        quantity: 1,
        imageUrl: this.product().images[0].url
      });

      this.onAddToCart.emit(addedItem);

      // Show success notification
      this.errorService.addError({
        code: 'CART_SUCCESS',
        message: 'Item added to cart successfully'
      });
    } catch (error) {
      this.errorService.addError({
        code: 'CART_ERROR',
        message: 'Failed to add item to cart. Please try again.'
      });
    } finally {
      this.isAddingToCart = false;
    }
  }
  onIntersecting(isIntersecting: boolean) {
    // Could be used for analytics or lazy loading
    if (isIntersecting) {
      // Track impression
    }
  }
}