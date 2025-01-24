// src/app/core/components/product/product-card.component.ts
import { Component, inject, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartItem, CartStore } from '../../state/cart.store';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <div class="product-card">
      <div class="relative">
        @if (!loading()) {
          <img
            [src]="product().images[0].url"
            [alt]="product().name"
            class="product-image"
            loading="lazy"
          />

          <!-- Quick Actions -->
          <div class="product-actions">
            <div class="transform translate-y-4 transition-transform hover:translate-y-0 flex gap-2">
              <button
                class="btn btn-secondary"
                (click)="handleQuickView.emit(product())"
              >
                Quick View
              </button>
              @if (product().stockLevel > 0) {
                <button
                  class="btn btn-primary"
                  (click)="addToCart()"
                  [disabled]="loading() || isAddingToCart"
                >
                  @if (isAddingToCart) {
                    <span class="flex items-center gap-2">
                      <span class="loading-spinner h-4 w-4"></span>
                      Adding...
                    </span>
                  } @else {
                    Add to Cart
                  }
                </button>
              }
            </div>
          </div>

          <!-- Status Tags -->
          <div class="absolute top-2 right-2 flex flex-col gap-2">
            @if (product().compareAtPrice) {
              <span class="badge badge-error">
                SALE
              </span>
            }
            @if (product().stockLevel <= 0) {
              <span class="badge badge-secondary">
                Out of Stock
              </span>
            } @else if (product().stockLevel < 5) {
              <span class="badge badge-warning">
                Low Stock
              </span>
            }
          </div>
        } @else {
          <div class="loading-shimmer w-full h-full"></div>
        }
      </div>

      <div class="product-content">
        @if (!loading()) {
          <h3 class="product-title">
            <a
              [routerLink]="['/products', product().id]"
              class="hover:text-primary transition"
            >
              {{ product().name }}
            </a>
          </h3>

          <p class="product-description">
            {{ product().description }}
          </p>

          <div class="flex items-center justify-between mt-4">
            <div class="flex items-baseline gap-2">
              <span class="product-price">
                {{ product().price | currency }}
              </span>
              @if (product().compareAtPrice) {
                <span class="text-sm text-muted-foreground line-through">
                  {{ product().compareAtPrice | currency }}
                </span>
              }
            </div>
          </div>
        } @else {
          <div class="space-y-2">
            <div class="loading-shimmer h-4 w-3/4"></div>
            <div class="loading-shimmer h-4 w-1/2"></div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProductCardComponent {
  private readonly cartStore = inject(CartStore);
  private readonly errorService = inject(ErrorService);
  inView = input(false);
  product = input.required<Product>();
  loading = input(false);

  handleQuickView = output<Product>();
  handleAddToCart = output<CartItem>();

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

      this.handleAddToCart.emit(addedItem);

      // Show success notification
      this.errorService.addError({
        code: 'CART_SUCCESS',
        message: 'Item added to cart successfully'
      });
    } catch {
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