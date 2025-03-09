import { Component, computed, inject, signal } from "@angular/core";
import { SectionComponent } from "../../../../core/components/layout/section.component";
import { ContainerComponent } from "../../../../core/components/layout/container.component";
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from "@angular/common";
import { OnInit } from '@angular/core';
import { ProductService } from "../../../../core/services/product.service";
import { Product } from "../../../../shared/models/product.model";
import { CartStore } from "../../../../core/state";
import { ErrorService } from "../../../../core/services/error.service";
import { FormsModule } from "@angular/forms";
import { CurrencyPipe } from "@angular/common";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [
    SectionComponent,
    ContainerComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    CurrencyPipe
  ],
  template: `
    @if (product()) {
      <div class="page-container">
        <app-container>
          <app-section>
            <!-- Product Detail -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Product Image -->
              <div>
                <img 
                  [src]="imageUrl()" 
                  [alt]="product()?.name" 
                  class="w-full h-auto rounded-lg shadow-lg">
              </div>
    
              <!-- Product Info -->
              <div class="space-y-6">
                <h1 class="h1 text-brand-navy text-foreground">{{ product()?.name }}</h1>
                <p class="text-lg text-brand-gray">{{ product()?.description }}</p>
    
                <!-- Product Price -->
                <div class="flex items-center gap-2 mt-4">
                  <span class="text-2xl font-bold text-brand-navy">{{ product()?.price | currency }}</span>
                  <span class="text-sm text-muted-foreground">/ {{ unit }}</span>
                </div>
    
                <!-- Product Sizes -->
                <div class="mt-6">
                  <h3 class="text-lg font-medium mb-2">Select Size</h3>
                  <div class="flex flex-wrap gap-2">
                    @for (size of sizes; track size) {
                      <button 
                        type="button"
                        class="size-btn px-4 py-2 border rounded-md transition-colors"
                        [class.bg-primary]="selectedSize() === size"
                        [class.text-white]="selectedSize() === size"
                        (click)="selectSize(size)">
                        {{ size }}
                      </button>
                    }
                  </div>
                </div>
    
                <!-- Product Colors -->
                <div class="mt-6">
                  <h3 class="text-lg font-medium mb-2">Select Color</h3>
                  <div class="flex flex-wrap gap-3">
                    @for (color of colors; track color) {
                      <button 
                        type="button"
                        class="color-btn w-8 h-8 rounded-full border-2 transition-transform"
                        [style.background-color]="color.toLowerCase()"
                        [class.scale-110]="selectedColor() === color"
                        [class.border-primary]="selectedColor() === color"
                        [class.border-gray-200]="selectedColor() !== color"
                        (click)="selectColor(color)">
                      </button>
                    }
                  </div>
                </div>

                <!-- Quantity -->
                <div class="mt-6">
                  <h3 class="text-lg font-medium mb-2">Quantity</h3>
                  <div class="flex items-center">
                    <button 
                      type="button" 
                      class="px-3 py-1 border rounded-l-md hover:bg-accent"
                      (click)="updateQuantity(-1)"
                      [disabled]="quantity() <= 1">
                      -
                    </button>
                    <div class="px-4 py-1 border-t border-b text-center min-w-[3rem]">
                      {{ quantity() }}
                    </div>
                    <button 
                      type="button" 
                      class="px-3 py-1 border rounded-r-md hover:bg-accent"
                      (click)="updateQuantity(1)">
                      +
                    </button>
                  </div>
                </div>
                
                <!-- Add to Cart Button -->
                <div class="mt-8">
                  <button 
                    type="button"
                    class="w-full py-3 px-6 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
                    [disabled]="isAddingToCart()"
                    (click)="addToCart()">
                    @if (isAddingToCart()) {
                      <span class="flex items-center justify-center gap-2">
                        <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Adding...
                      </span>
                    } @else {
                      Add to Cart
                    }
                  </button>
                </div>
                
                <!-- Product Details -->
                <div class="mt-8 pt-6 border-t">
                  <h3 class="text-lg font-medium mb-2">Product Details</h3>
                  <ul class="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Material: Premium Quality</li>
                    <li>Care: Machine washable</li>
                    <li>Origin: Made in Sweden</li>
                    @if (product()?.stockLevel !== undefined) {
                      <li class="font-medium" [class.text-green-600]="(product()?.stockLevel ?? 0) > 10" [class.text-amber-600]="(product()?.stockLevel ?? 0) <= 10 && (product()?.stockLevel ?? 0) > 0" [class.text-red-600]="(product()?.stockLevel ?? 0) === 0">
                        Stock: {{  (product()?.stockLevel ?? 0) > 0 ? ( (product()?.stockLevel ?? 0) > 10 ? 'In Stock' : 'Low Stock') : 'Out of Stock' }}
                      </li>
                    }
                  </ul>
                </div>
              </div>
            </div>
          </app-section>
          
          <!-- Similar Products Section -->
          <app-section>
            <div class="mt-16">
              <h2 class="text-2xl font-bold mb-6">Similar Products</h2>
              
              <div class="relative">
                <!-- Left Navigation Button (hidden on mobile) -->
                <button 
                  type="button"
                  class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hidden md:block hover:bg-white"
                  (click)="scrollProducts('left')"
                  *ngIf="canScrollLeft()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                
                <!-- Products Carousel -->
                <div class="carousel-container overflow-x-auto hide-scrollbar">
                  <div class="flex space-x-4" #productCarousel>
                    @for (i of [1, 2, 3, 4, 5, 6]; track i) {
                      <div class="product-card min-w-[280px] border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <a [routerLink]="['/products', i]">
                          <img [src]="'assets/Pics/' + i + '.webp'" alt="Product" class="w-full h-48 object-cover">
                          <div class="p-4">
                            <h3 class="font-medium">Product Name {{ i }}</h3>
                            <p class="text-sm text-muted-foreground mb-2">Category</p>
                            <p class="font-bold">{{ 99.99 * i | currency }}</p>
                          </div>
                        </a>
                      </div>
                    }
                  </div>
                </div>
                
                <!-- Right Navigation Button (hidden on mobile) -->
                <button 
                  type="button"
                  class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hidden md:block hover:bg-white"
                  (click)="scrollProducts('right')"
                  *ngIf="canScrollRight()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          </app-section>
        </app-container>
      </div>
    } @else {
      <div class="flex justify-center items-center h-[50vh]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }
  `,
  styles: [`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .carousel-container {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
  `]
})
export class ProductDetailPageComponent implements OnInit {
  unit = "each";
  sizes = ["S", "M", "L", "XL"];
  colors = ["Red", "Green", "Blue", "Black", "White"];

  product = signal<Product | null>(null);
  selectedSize = signal<string>("M");
  selectedColor = signal<string>("Black");
  quantity = signal<number>(1);
  isAddingToCart = signal<boolean>(false);

  private readonly cartStore = inject(CartStore);
  private readonly errorService = inject(ErrorService);

  imageUrl = computed<string>(() => {
    const p = this.product();
    if (p && p.images && p.images.length > 0 && p.images[0].url) {
      return p.images[0].url;
    }
    const n = 1;
    return `assets/Pics/${n}.webp`;
  });

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(id).subscribe(prod => {
        this.product.set(prod);
      });
    }
  }

  selectSize(size: string): void {
    this.selectedSize.set(size);
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  updateQuantity(change: number): void {
    const newQuantity = this.quantity() + change;
    if (newQuantity >= 1) {
      this.quantity.set(newQuantity);
    }
  }

  async addToCart(): Promise<void> {
    if (!this.product()) return;

    this.isAddingToCart.set(true);

    try {
      await this.cartStore.addItem({
        productId: this.product()!.id,
        name: this.product()!.name,
        price: this.product()!.price,
        quantity: this.quantity(),
        imageUrl: this.imageUrl()
      });

      // Show success feedback
      this.errorService.addError(
        'CART_SUCCESS',
        `Added ${this.quantity()} ${this.product()!.name} to your cart`,
        { severity: 'info', timeout: 3000 }
      );
    } catch (error) {
      this.errorService.addError(
        'CART_ERROR',
        'Failed to add item to cart. Please try again.',
        { severity: 'error' }
      );
    } finally {
      this.isAddingToCart.set(false);
    }
  }

  // Carousel functionality
  private productCarouselElement: HTMLElement | null = null;

  scrollProducts(direction: 'left' | 'right'): void {
    if (!this.productCarouselElement) {
      this.productCarouselElement = document.querySelector('.carousel-container');
    }

    if (this.productCarouselElement) {
      const scrollAmount = 300;
      if (direction === 'left') {
        this.productCarouselElement.scrollLeft -= scrollAmount;
      } else {
        this.productCarouselElement.scrollLeft += scrollAmount;
      }
    }
  }

  canScrollLeft(): boolean {
    if (!this.productCarouselElement) {
      this.productCarouselElement = document.querySelector('.carousel-container');
    }
    return this.productCarouselElement ? this.productCarouselElement.scrollLeft > 0 : false;
  }

  canScrollRight(): boolean {
    if (!this.productCarouselElement) {
      this.productCarouselElement = document.querySelector('.carousel-container');
    }
    if (!this.productCarouselElement) return false;

    return this.productCarouselElement.scrollLeft + this.productCarouselElement.clientWidth <
      this.productCarouselElement.scrollWidth;
  }
}

