// src/app/core/components/product/quick-view-modal.component.ts
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartStore } from '../../state/cart.store';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-quick-view-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  template: `
    @if (isOpen()) {
      <div class="modal animate-in">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="text-lg font-semibold">Quick View</h3>
            <button 
              class="modal-close"
              (click)="close.emit()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Image Gallery -->
            <div class="relative aspect-square rounded-lg overflow-hidden">
              <img 
                [src]="product().images[selectedImage]?.url" 
                [alt]="product().name"
                class="product-image"
              />
              
              @if (product().images.length > 1) {
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  @for (image of product().images; track image.id; let i = $index) {
                    <button 
                      class="w-2 h-2 rounded-full transition-colors"
                      [class]="i === selectedImage ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground'"
                      (click)="selectedImage = i"
                    > </button>
                  }
                </div>
              }
            </div>

            <!-- Product Details -->
            <div class="space-y-6">
              <div>
                <h2 class="text-2xl font-semibold">{{ product().name }}</h2>
                <div class="mt-2 flex items-baseline gap-2">
                  <span class="text-2xl font-bold">
                    {{ totalPrice() | currency }}
                  </span>
                  @if (quantity() > 1) {
                    <span class="text-sm text-muted-foreground">
                      ({{ product().price | currency }} each)
                    </span>
                  }
                  @if (product().compareAtPrice) {
                    <span class="text-lg text-muted-foreground line-through">
                      {{ product().compareAtPrice | currency }}
                    </span>
                  }
                </div>
              </div>

              <p class="text-muted-foreground">{{ product().description }}</p>

              <!-- Variants Selection -->
              @if (product().variants?.length) {
                <div class="form-group">
                  <label class="form-label">Select Option</label>
                  <select 
                    [(ngModel)]="selectedVariant"
                    class="form-input"
                  >
                    @for (variant of product().variants; track variant.id) {
                      <option 
                        [value]="variant.id"
                        [disabled]="variant.stockLevel === 0"
                      >
                        {{ variant.name }} - {{ variant.price | currency }}
                        {{ variant.stockLevel === 0 ? ' (Out of Stock)' : '' }}
                      </option>
                    }
                  </select>
                </div>
              }

              <!-- Quantity -->
              <div class="form-group">
                <label class="form-label">Quantity</label>
                <select 
                  [ngModel]="quantity()"
                  (ngModelChange)="quantity.set($event)"
                  class="form-input"
                  [disabled]="product().stockLevel === 0"
                >
                  @for (num of [1,2,3,4,5]; track num) {
                    <option [value]="num">{{ num }}</option>
                  }
                </select>
              </div>

              <!-- Actions -->
              <div class="space-y-3">
                <button
                  class="btn btn-primary w-full"
                  (click)="addToCart()"
                  [disabled]="product().stockLevel === 0 || isAddingToCart"
                >
                  @if (isAddingToCart) {
                    <span class="flex items-center justify-center gap-2">
                      <span class="loading-spinner h-4 w-4"></span>
                      Adding...
                    </span>
                  } @else if (product().stockLevel === 0) {
                    Out of Stock
                  } @else {
                    Add to Cart
                  }
                </button>

                <a 
                  [routerLink]="['/products', product().id]"
                  class="btn btn-outline w-full"
                >
                  View Full Details
                </a>
              </div>

              <!-- Additional Info -->
              <div class="border-t pt-6 space-y-4">
                @if (product().stockLevel > 0) {
                  <div class="flex items-center text-green-600">
                    <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    <span>In Stock</span>
                  </div>
                }
                <div class="flex items-center text-muted-foreground">
                  <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="3" width="15" height="13"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <span>Free Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class QuickViewModalComponent {
  private cartStore = inject(CartStore);
  private errorService = inject(ErrorService);

  product = input.required<Product>();
  isOpen = input(false);
  close = output<void>();

  selectedImage = 0;
  selectedVariant: string | null = null;
  quantity = signal(1); // Convert to signal  
  isAddingToCart = false;
  totalPrice = computed(() => {
    const basePrice = this.selectedVariant
      ? this.product().variants.find((v: { id: string | null; }) => v.id === this.selectedVariant)?.price
      : this.product().price;

    return (basePrice || 0) * this.quantity();
  });
  async addToCart() {
    this.isAddingToCart = true;

    try {
      const variant = this.product().variants?.find((v: { id: string | null; }) => v.id === this.selectedVariant);

      await this.cartStore.addItem({
        productId: this.product().id,
        variantId: variant?.id,
        name: this.product().name,
        price: variant?.price ?? this.product().price, // Use raw number
        quantity: this.quantity(),
        imageUrl: this.product().images[0].url
      });

      this.close.emit();
    } catch {
      this.errorService.addError({
        code: 'CART_ERROR',
        message: 'Failed to add item to cart. Please try again.'
      });
    } finally {
      this.isAddingToCart = false;
    }
  }
}