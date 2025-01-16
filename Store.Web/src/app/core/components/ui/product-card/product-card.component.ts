import { Component, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { IntersectionObserverDirective } from '../../../../directives/intersection-observer.directive';
import { fadeAnimation } from '../../../animations/fade.animation/fade.animation';

@Component({
  selector: 'app-product-card',
  imports: [IntersectionObserverDirective, CurrencyPipe],
  animations: [fadeAnimation],
  template: `
    <div 
      class="group relative rounded-lg border bg-card p-4 hover-lift press-animation"
      appIntersectionObserver
      (intersecting)="isVisible.set($event)"
        [@fade]="isVisible" >
      <div class="relative overflow-hidden rounded-md aspect-square">
        <img
          [src]="product().imageUrl"
          [alt]="product().name"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        <!-- Quick view overlay -->
        <div 
          class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
        >
          <button 
            class="px-4 py-2 bg-white text-black rounded-md transform translate-y-4 transition-transform group-hover:translate-y-0"
            (click)="onQuickView()"
          >
            Quick View
          </button>
        </div>
      </div>

      <!-- Product info with stagger animation -->
      <div class="mt-4 space-y-2">
        @if (isVisible) {
          <h3 
            class="font-medium leading-none animate-in"
            style="animation-delay: 100ms;"
          >
            {{ product().name }}
          </h3>
          
          <p 
            class="text-muted-foreground animate-in"
            style="animation-delay: 200ms;"
          >
            {{ product().price | currency }}
          </p>
          
          <!-- Stock status with animation -->
          <div 
            class="flex items-center space-x-2 animate-in"
            style="animation-delay: 300ms;"
          >
            @if (product().stockLevel > 0) {
              <span class="flex items-center text-sm text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M20 6 9 17l-5-5"/></svg>
                In Stock
              </span>
            } @else {
              <span class="flex items-center text-sm text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                Out of Stock
              </span>
            }
          </div>

          <!-- Add to cart button -->
          <button 
            class="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all animate-in press-animation"
            style="animation-delay: 400ms;"
            (click)="onAddToCart()"
            [disabled]="product().stockLevel === 0"
          >
            @if (loading()) {
              <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Adding...
              </span>
            } @else {
              Add to Cart
            }
          </button>
        }
      </div>
    </div>
  `
})
export class ProductCardComponent {
  product = input.required<any>();
  loading = input(false);
  isVisible = signal(false);
  onQuickView() {
    // Implement quick view logic
  }

  onAddToCart() {
    // Implement add to cart logic
  }
}