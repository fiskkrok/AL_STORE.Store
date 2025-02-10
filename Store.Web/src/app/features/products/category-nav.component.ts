import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProductStore } from '../../../core/state/product.store';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="p-4 border-b">
      <div class="container flex items-center space-x-8 overflow-x-auto">
        <a 
          routerLink="/products"
          routerLinkActive="text-primary font-medium"
          [routerLinkActiveOptions]="{ exact: true }"
          class="whitespace-nowrap transition-colors hover:text-primary"
        >
          All Products
        </a>
        
        @for (category of categories(); track category.id) {
          <a 
            [routerLink]="['/products', { category: category.id }]"
            routerLinkActive="text-primary font-medium"
            class="whitespace-nowrap transition-colors hover:text-primary"
          >
            {{ category.name }}
          </a>
        }
      </div>
    </nav>
  `
})
export class CategoryNavComponent {
  private productStore = inject(ProductStore);
  categories = this.productStore.categories;
}