// src/app/features/products/components/product-detail.component.ts
import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ContainerComponent } from '../../core/components/layout/container.component';
import { ErrorService } from '../../core/services/error.service';
import { CartStore } from '../../core/state/cart.store';
import { ProductStore } from '../../core/state/product.store';
import { ReviewsComponent } from './reviews.component';
import { SizeGuideComponent } from './size-guide.component';
import { Product, ProductImage } from '../../shared/models/product.model';


@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ContainerComponent,
    SizeGuideComponent,
    ReviewsComponent,
    CurrencyPipe
  ],
  template: `
    <div class="min-h-screen bg-background">
      @if (loading()) {
        <div class="animate-pulse">
          <!-- Loading skeleton -->
          <app-container>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
              <div class="aspect-square bg-gray-200 rounded-lg"></div>
              <div class="space-y-4">
                <div class="h-8 bg-gray-200 rounded w-3/4"></div>
                <div class="h-6 bg-gray-200 rounded w-1/4"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-gray-200 rounded"></div>
                  <div class="h-4 bg-gray-200 rounded"></div>
                  <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </app-container>
        </div>
      } @else if (product()) {
        <app-container>
          <!-- Breadcrumbs -->
          <nav class="py-4">
            <ol class="flex text-sm">
              <li><a routerLink="/" class="text-muted-foreground hover:text-foreground">Home</a></li>
              <li class="mx-2 text-muted-foreground">/</li>
              <li><a routerLink="/products" class="text-muted-foreground hover:text-foreground">Products</a></li>
              <li class="mx-2 text-muted-foreground">/</li>
              <li>{{ product()?.name }}</li>
            </ol>
          </nav>

          <!-- Product Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
            <!-- Image Gallery -->
            <div class="space-y-4">
              <div class="aspect-square relative rounded-lg overflow-hidden">
                <img 
                  [src]="selectedImage()?.url" 
                  [alt]="product()?.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="grid grid-cols-4 gap-4">
                @for (image of product()?.images; track image.id) {
                  <button 
                    class="aspect-square rounded-md overflow-hidden border-2 transition-colors"
                    [class.border-brand-navy]="selectedImage()?.id === image.id"
                    [class.border-transparent]="selectedImage()?.id !== image.id"
                    (click)="setSelectedImage(image)"
                  >
                    <img [src]="image.url" [alt]="product()?.name" class="w-full h-full object-cover" />
                  </button>
                }
              </div>
            </div>

            <!-- Product Details -->
            <div class="space-y-6">
              <div>
                <h1 class="text-3xl font-bold">{{ product()?.name }}</h1>
                <div class="mt-4 flex items-baseline gap-4">
                  <span>{{ product()?.price | currency }}</span>
    <span>{{ product()?.compareAtPrice | currency }}</span>
                  <!-- <span class="text-3xl font-bold">{{ product()?.price | currency }}</span>
                  @if (product()?.compareAtPrice) {
                    <span class="text-xl text-muted-foreground line-through">
                      {{ product()?.compareAtPrice | currency }}
                    </span>
                  } -->
                </div>
              </div>

              <div class="prose prose-sm">
                <p>{{ product()?.description }}</p>
              </div>

              <!-- Variants Selection -->
              @if (product()?.variants?.length) {
                <div>
                  <label for="" class="text-sm form-label font-medium block mb-2">Select Option</label>
                  <select 
                    [(ngModel)]="selectedVariantId"
                    class="w-full px-4 py-2 border rounded-lg"
                  >
                    @for (variant of product()?.variants; track variant.id) {
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
              <div>
                <label for="" class="text-sm form-label font-medium block mb-2">Quantity</label>
                <select 
                  [(ngModel)]="quantity"
                  class="w-full px-4 py-2 border rounded-lg"
                  [disabled]="!isInStock()"
                >
                  @for (num of quantityOptions(); track num) {
                    <option [value]="num">{{ num }}</option>
                  }
                </select>
              </div>

              <!-- Add to Cart -->
              <button
                class="w-full px-8 py-4 bg-brand-navy text-white rounded-lg hover:bg-opacity-90 transition press-effect"
                (click)="addToCart()"
                [disabled]="!isInStock() || addingToCart()"
              >
                @if (addingToCart()) {
                  <span class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Adding to Cart...
                  </span>
                } @else if (!isInStock()) {
                  Out of Stock
                } @else {
                  Add to Cart
                }
              </button>

              <!-- Additional Info -->
              <div class="border-t pt-6 space-y-4">
                <!-- Stock Status -->
                <div class="flex items-center">
                  @if (isInStock()) {
                    <svg class="text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    <span class="text-green-500">In Stock</span>
                  } @else {
                    <svg class="text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span class="text-red-500">Out of Stock</span>
                  }
                </div>

                <!-- Shipping -->
                <div class="flex items-center">
                  <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  <span>Free Shipping</span>
                </div>

                <!-- Returns -->
                <div class="flex items-center">
                  <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 12h4l3-9 4 18 3-9h4"/>
                  </svg>
                  <span>30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Product Tabs -->
          <div class="py-8 border-t">
            <div class="border-b">
              <nav class="flex space-x-8">
                @for (tab of tabs; track tab) {
                  <button
                    class="py-4 text-sm font-medium border-b-2 transition-colors"
                    [class.border-brand-navy]="activeTab() === tab"
                    [class.border-transparent]="activeTab() !== tab"
                    [class.text-brand-navy]="activeTab() === tab"
                    [class.text-muted-foreground]="activeTab() !== tab"
                    (click)="setActiveTab(tab)"
                  >
                    {{ tab }}
                  </button>
                }
              </nav>
            </div>

            <div class="py-6">
              @switch (activeTab()) {
                @case ('Description') {
                  <div class="prose max-w-none">
                    {{ product()?.description }}
                  </div>
                }
                @case ('Details') {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    @for (attribute of product()?.attributes | keyvalue; track attribute.key) {
                      <div>
                        <dt class="text-sm font-medium text-muted-foreground">{{ attribute.key }}</dt>
                        <dd class="mt-1">{{ attribute.value }}</dd>
                      </div>
                    }
                  </div>
                }
                @case ('Size Guide') {
                  <app-size-guide />
                }
                @case ('Reviews') {
                  <app-reviews />
                }
              }
            </div>
          </div>

          <!-- Related Products
          @if (relatedProducts().length) {
            <section class="py-12 border-t">
              <h2 class="text-2xl font-bold mb-6">You May Also Like</h2>
              <app-grid>
                @for (product of relatedProducts(); track product.id) {
                  <app-product-card
                    [product]="product"
                    [loading]="false"
                    (handleQuickView)="openQuickView($event)"
                    (handleAddToCart)="addToCart()"
                  />
                }
              </app-grid>
            </section>
          } -->
        </app-container>
      }
    </div>
  `
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productStore = inject(ProductStore);
  private readonly cartStore = inject(CartStore);
  private readonly errorService = inject(ErrorService);
  private readonly quickViewProduct = signal<Product | null>(null);

  // State
  loading = signal(true);
  product = signal<Product | null>(null);
  selectedVariantId = signal<string | null>(null);
  quantity = signal(1);
  addingToCart = signal(false);
  selectedImage = signal<ProductImage | null>(null);
  activeTab = signal<string>('Description');

  // Constants
  tabs = ['Description', 'Details', 'Size Guide', 'Reviews'];

  // Computed
  quantityOptions = computed(() => Array.from({ length: 5 }, (_, i) => i + 1));
  isInStock = computed(() => {
    const product = this.product();
    if (!product) return false;

    if (this.selectedVariantId()) {
      const variant = product.variants?.find((v: { id: string | null; }) => v.id === this.selectedVariantId());
      return variant ? variant.stockLevel > 0 : false;
    }

    return product.stockLevel > 0;
  });

  // relatedProducts = computed(() => {
  //   const currentProduct = this.product();
  //   if (!currentProduct) return [];

  //   return this.productStore.getRelatedProducts(currentProduct.id);
  // });


  constructor() {
    // Load product data
    effect(() => {
      const productId = this.route.snapshot.paramMap.get('id');
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }
  openQuickView(product: Product) {
    this.quickViewProduct.set(product);
  }
  // Add method to close quick view
  closeQuickView() {
    this.quickViewProduct.set(null);
  }
  private async loadProduct(id: string) {
    this.loading.set(true);
    try {
      const product = await this.productStore.getProduct(id);
      this.product.set(product);
      if (product?.images?.length) {
        this.selectedImage.set(product?.images[0]);
      }

    } catch {
      this.errorService.addError(
        'PRODUCT_LOAD_ERROR',
        'Failed to load product details'
      );
    } finally {
      this.loading.set(false);
    }
  }

  setSelectedImage(image: ProductImage) {
    this.selectedImage.set(image);
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  // Complete addToCart method
  async addToCart() {
    if (!this.product() || this.addingToCart()) return;

    this.addingToCart.set(true);
    try {
      const product = this.product()!;
      const variant = product.variants?.find((v: { id: string | null; }) => v.id === this.selectedVariantId());

      await this.cartStore.addItem({
        productId: product.id,
        variantId: variant?.id,
        name: product.name,
        price: variant?.price ?? product.price,
        quantity: this.quantity(),
        imageUrl: this.selectedImage()?.url || product.images[0].url
      });

      // Show success message
      this.errorService.addError(
        'CART_SUCCESS',
        'Product added to cart successfully'
      );
    } catch {
      this.errorService.addError(
        'CART_ERROR',
        'Failed to add item to cart. Please try again.'
      );
    } finally {
      this.addingToCart.set(false);
    }
  }
};
