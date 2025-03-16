// src/app/core/components/product/product-card.component.ts
// imports

import { CommonModule, CurrencyPipe } from "@angular/common";
import { Component, input, output, inject, computed } from "@angular/core";
import { Product } from "../../../shared/models";
import { ProductService } from "../../services/product.service";
import { CartItem } from "../../state";
import { CardComponent } from "../card.component";
import { RatingStarsComponent } from "../rating-stars/rating-stars.component";
import { Router } from "@angular/router";

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, CardComponent, RatingStarsComponent],
  template: `
    <app-card
      [imageUrl]="imageUrl()(product())"
      [imageAlt]="product().name"
      [title]="product().name"
      [description]="product().description"
      [overlaySlot]="true"
      [badgeSlot]="true"
      [clickable]="!loading()"
      [selected]="selected()"
      (cardClick)="navigateToProduct()"
    >
      <!-- Product badges -->
      <ng-container cardBadge>
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
      </ng-container>
      
      <!-- Quick action overlay -->
      <div cardOverlay class="flex gap-2">
        <button
          class="btn btn-secondary btn-sm"
          (click)="$event.stopPropagation(); handleQuickView.emit(product())"
        >
          Quick View
        </button>
        @if (isInStock()) {
          <button
            class="btn btn-primary btn-sm"
            (click)="$event.stopPropagation(); addToCart()"
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
      
      <!-- Card content (price and ratings) -->
      <div cardFooter class="mt-4 flex items-center justify-between">
        <div class="flex items-baseline gap-2">
          <span class="text-lg font-bold">
            {{ product().price | currency }}
          </span>
          @if (product().compareAtPrice) {
            <span class="text-sm text-muted-foreground line-through">
              {{ product().compareAtPrice | currency }}
            </span>
          }
        </div>

        @if (rating()) {
          <app-rating-stars [rating]="rating()" [count]="ratingCount()"></app-rating-stars>
        }
      </div>
    </app-card>
  `
})
export class ProductCardComponent {
  // Products will still be handled by this component
  product = input.required<Product>();
  loading = input(false);
  addingToCart = input(false);
  selected = input(false);

  // Outputs
  handleQuickView = output<Product>();
  handleAddToCart = output<CartItem>();

  // Private service
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  // Computed values
  imageUrl = this.productService.getProductImageUrl;
  isInStock = computed(() => this.product().stockLevel > 0);
  lowStock = computed(() => this.product().stockLevel <= 5 && this.product().stockLevel > 0);
  rating = computed(() => this.product().ratings?.average ?? 0);
  ratingCount = computed(() => this.product().ratings?.count ?? 0);
  discount = computed(() => {
    if (!this.product().compareAtPrice) return 0;
    return Math.round(
      ((this.product().compareAtPrice! - this.product().price) /
        this.product().compareAtPrice!) * 100
    );
  });

  // Actions
  navigateToProduct() {
    this.router.navigate(['/products', this.product().id]);
  }

  addToCart(): void {
    if (!this.isInStock()) return;
    this.handleAddToCart.emit({
      productId: this.product().id,
      name: this.product().name,
      price: this.product().price,
      quantity: 1,
      imageUrl: this.imageUrl()(this.product()), // Corrected line
      id: ''
    });
  }
}