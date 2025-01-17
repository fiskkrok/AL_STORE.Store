// src/app/core/components/product/quick-view-modal.component.ts
import { Component, inject, input, output } from '@angular/core';
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
  providers: [CurrencyPipe],
  template: `
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        (click)="close.emit()"
      >
        <div 
          class="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] animate-in"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal Content -->
          <div class="relative rounded-lg bg-background shadow-lg">
            <!-- Close Button -->
            <button 
              class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              (click)="close.emit()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <!-- Image Gallery -->
              <div class="relative aspect-square">
                <img 
                  [src]="product().images[selectedImage]?.url" 
                  [alt]="product().name"
                  class="h-full w-full object-cover"
                />
                
                @if (product().images.length > 1) {
                  <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    @for (image of product().images; track image.id; let i = $index) {
                      <button 
                        class="w-2 h-2 rounded-full transition-colors"
                        [class]="i === selectedImage ? 'bg-brand-navy' : 'bg-gray-300 hover:bg-gray-400'"
                        (click)="selectedImage = i"
                      ></button>
                    }
                  </div>
                }
              </div>

              <!-- Product Details -->
              <div class="p-6">
                <div class="mb-4">
                  <h2 class="text-2xl font-semibold">{{ product().name }}</h2>
                  
                  <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold">{{ product().price | currency }}</span>
                    @if (product().compareAtPrice) {
                      <span class="text-lg text-muted-foreground line-through">
                        {{ product().compareAtPrice | currency }}
                      </span>
                    }
                  </div>
                </div>

                <p class="text-muted-foreground">{{ product().description }}</p>

                @if (product().variants?.length) {
                  <div class="mt-6">
                    <label class="text-sm font-medium mb-2 block">
                      Select Variant
                    </label>
                    <select 
                      [(ngModel)]="selectedVariant"
                      class="w-full px-3 py-2 border rounded-md"
                    >
                      @for (variant of product().variants; track variant.id) {
                        <option 
                          [value]="variant.id"
                          [disabled]="variant.stockLevel === 0"
                        >
                          {{ variant.name }} - {{ variant.price | currency }}
                          {{ variant.stockLevel === 0 ? '(Out of Stock)' : '' }}
                        </option>
                      }
                    </select>
                  </div>
                }

                <div class="mt-6">
                  <label class="text-sm font-medium mb-2 block">
                    Quantity
                  </label>
                  <select 
                    [(ngModel)]="quantity"
                    class="w-full px-3 py-2 border rounded-md"
                    [disabled]="product().stockLevel === 0"
                  >
                    @for (num of [1,2,3,4,5]; track num) {
                      <option [value]="num">{{ num }}</option>
                    }
                  </select>
                </div>

                <div class="mt-6 space-y-3">
                  <button
                    class="w-full px-6 py-3 bg-brand-navy text-white rounded-md hover:bg-opacity-90 transition press-effect"
                    (click)="addToCart()"
                    [disabled]="product().stockLevel === 0 || isAddingToCart"
                  >
                    @if (isAddingToCart) {
                      <span class="flex items-center justify-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
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
                    class="block w-full px-6 py-3 text-center border border-brand-navy text-brand-navy rounded-md hover:bg-brand-navy hover:text-white transition"
                  >
                    View Full Details
                  </a>
                </div>

                <!-- Additional Info -->
                <div class="mt-6 pt-6 border-t">
                  <div class="space-y-4 text-sm">
                    @if (product().stockLevel > 0) {
                      <p class="flex items-center text-green-600">
                        <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                        In Stock
                      </p>
                    }
                    <p class="flex items-center">
                      <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/>
                        <path d="m7.5 4.27 9 5.15"/>
                        <polyline points="3.29 7 12 12 20.71 7"/>
                        <line x1="12" y1="22" x2="12" y2="12"/>
                        <circle cx="18.5" cy="15.5" r="2.5"/>
                        <path d="M20.27 17.27 22 19"/>
                      </svg>
                      Free Shipping
                    </p>
                  </div>
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
  private currencyPipe = inject(CurrencyPipe);

  product = input.required<Product>();
  isOpen = input(false);
  close = output<void>();

  selectedImage = 0;
  selectedVariant: string | null = null;
  quantity = 1;
  isAddingToCart = false;

  async addToCart() {
    this.isAddingToCart = true;

    try {
      const variant = this.product().variants?.find((v: { id: string | null; }) => v.id === this.selectedVariant);

      await this.cartStore.addItem({
        productId: this.product().id,
        variantId: variant?.id,
        name: this.product().name,
        price: variant?.price ?? this.product().price, // Use raw number
        quantity: this.quantity,
        imageUrl: this.product().images[0].url
      });

      this.close.emit();
    } catch (error) {
      this.errorService.addError({
        code: 'CART_ERROR',
        message: 'Failed to add item to cart. Please try again.'
      });
    } finally {
      this.isAddingToCart = false;
    }
  }
}