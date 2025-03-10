// src/app/core/components/product/quick-view-modal.component.ts
// imports

import { CommonModule, CurrencyPipe } from "@angular/common";
import { Component, inject, input, output, signal, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Product } from "../../../shared/models";
import { ErrorService } from "../../services/error.service";
import { ProductService } from "../../services/product.service";
import { CartStore } from "../../state";
import { RatingStarsComponent } from "../rating-stars/rating-stars.component";

@Component({
  selector: 'app-quick-view-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, RatingStarsComponent],
  template: `
    @if (isOpen()) {
      <div class="modal animate-in">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="text-lg font-semibold text-foreground">Quick View</h3>
            <button 
              class="modal-close text-foreground"
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
                [src]="productService.getProductImageUrl()(product())"
                [alt]="product().name"
                class="w-full h-full object-cover"
              />
              
              @if (product().images.length > 1) {
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  @for (image of product().images; track image.id; let i = $index) {
                    <button 
                      class="w-2 h-2 rounded-full transition-colors"
                      [class]="i === selectedImage() ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground'"
                      (click)="selectedImage.set(i)"
                    > </button>
                  }
                </div>
              }
            </div>

            <!-- Product Details -->
            <div class="space-y-6">
              <div>
                <h2 class="text-2xl text-foreground font-semibold">{{ product().name }}</h2>
                <div class="mt-2 flex items-baseline gap-2">
                  <span class="text-2xl text-foreground font-bold">
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
                
                @if (product().ratings) {
                  <div class="mt-2">
                    <app-rating-stars 
                      [rating]="product().ratings?.average ?? 0"
                      [count]="product().ratings?.count ?? 0"
                    ></app-rating-stars>
                  </div>
                }
              </div>

              <p class="text-muted-foreground">{{ product().description }}</p>

              <!-- Variants Selection -->
              @if (product().variants.length) {
                <div class="form-group">
                  <label class="form-label" for="selectedVariant">Select Option</label>
                  <select 
                    id="selectedVariant"
                    [(ngModel)]="selectedVariantId"
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
                <label class="form-label" for="quantity">Quantity</label>
                <select 
                  id="quantity"
                  [ngModel]="quantity()"
                  (ngModelChange)="quantity.set($event)"
                  class="form-input text-foreground"
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
                  class="btn btn-primary w-full btn-lg"
                  (click)="addToCart()"
                  [disabled]="product().stockLevel === 0 || isAddingToCart()"
                >
                  @if (isAddingToCart()) {
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
                  class="btn btn-outline w-full text-foreground btn-lg"
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
  readonly productService = inject(ProductService);

  product = input.required<Product>();
  isOpen = input(false);
  close = output<void>();

  selectedImage = signal(0);
  selectedVariantId = signal<string | null>(null);
  quantity = signal(1);
  isAddingToCart = signal(false);

  totalPrice = computed(() => {
    const basePrice = this.selectedVariantId()
      ? this.product().variants.find(v => v.id === this.selectedVariantId())?.price
      : this.product().price;

    return (basePrice || 0) * this.quantity();
  });

  async addToCart() {
    this.isAddingToCart.set(true);

    try {
      const variant = this.product().variants?.find(v => v.id === this.selectedVariantId());

      await this.cartStore.addItem({
        productId: this.product().id,
        variantId: variant?.id,
        name: this.product().name,
        price: variant?.price ?? this.product().price,
        quantity: this.quantity(),
        imageUrl: this.productService.getProductImageUrl()(this.product()),
      });

      this.close.emit();
    } catch {
      this.errorService.addError(
        'CART_ERROR',
        'Failed to add item to cart. Please try again.');
    } finally {
      this.isAddingToCart.set(false);
    }
  }
}