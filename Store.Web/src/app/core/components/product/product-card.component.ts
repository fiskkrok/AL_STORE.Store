// src/app/core/components/product/product-card.component.ts
import { Component, computed, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartItem } from '../../state/cart.store';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <div class="product-card">
      <!-- Image Container -->
      <div class="relative aspect-square overflow-hidden">
        @if (!loading()) {
          <img
            [src]="product().images[0].url"
            [alt]="product().name"
            class="product-image"
            loading="lazy"
          />

          <!-- Quick Actions -->
          <div class="product-actions">
            <div class="flex gap-2 transform translate-y-4 transition-transform hover:translate-y-0">
              <button
                class="btn btn-secondary"
                (click)="handleQuickView.emit(product())"
              >
                Quick View
              </button>
              @if (isInStock()) {
                <button
                  class="btn btn-primary"
                  (click)="addToCart()"
                  [disabled]="loading() || addingToCart()"
                >
                  @if (addingToCart()) {
                    <span class="flex items-center gap-2">
                      <span class="loading-spinner h-4 w-4 border-2"></span>
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
            @if (discount()) {
              <span class="badge badge-error">
                -{{ discount() }}%
              </span>
            }
            @if (!isInStock()) {
              <span class="badge badge-secondary">
                Out of Stock
              </span>
            } @else if (lowStock()) {
              <span class="badge badge-warning">
                Low Stock
              </span>
            }
          </div>
        } @else {
          <div class="loading-shimmer w-full h-full"></div>
        }
      </div>

      <!-- Product Info -->
      <div class="product-content">
        @if (!loading()) {
          <div class="min-h-[6rem]">
            <h3 class="product-title">
              <a
                [routerLink]="['/products', product().id]"
                class="hover:text-primary transition-colors"
              >
                {{ product().name }}
              </a>
            </h3>

            <p class="product-description">
              {{ product().description }}
            </p>
          </div>

          <div class="mt-4 flex items-center justify-between">
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

            @if (rating()) {
              <div class="flex items-center gap-1">
                <div class="flex">
                  @for (star of [1,2,3,4,5]; track star) {
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      class="w-4 h-4"
                      [class]="star <= rating() ? 'text-yellow-400' : 'text-gray-200'"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0
                        00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0
                        00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1
                        1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1
                        1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0
                        00.951-.69l1.07-3.292z"
                      />
                    </svg>
                  }
                </div>
                <span class="text-sm text-muted-foreground">
                  ({{ ratingCount() }})
                </span>
              </div>
            }
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
  // Inputs
  product = input.required<Product>();
  loading = input(false);
  addingToCart = input(false);

  // Outputs
  handleQuickView = output<Product>();
  handleAddToCart = output<CartItem>();

  // Computed values
  isInStock = computed(() => this.product().stockLevel > 0);
  lowStock = computed(() => this.product().stockLevel <= 5 && this.product().stockLevel > 0);
  rating = computed(() => this.product().ratings?.average || 0);
  ratingCount = computed(() => this.product().ratings?.count || 0);
  discount = computed(() => {
    if (!this.product().compareAtPrice) return 0;
    return Math.round(
      ((this.product().compareAtPrice! - this.product().price!) /
        this.product().compareAtPrice!) * 100
    );
  });

  addToCart(): void {
    if (!this.isInStock()) return;

    this.handleAddToCart.emit({
      productId: this.product().id,
      name: this.product().name,
      price: this.product().price,
      quantity: 1,
      imageUrl: this.product().images[0].url,
      id: ''
    });
  }
}