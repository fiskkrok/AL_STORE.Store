import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductStore } from '../../../core/state/product.store';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-4">
      <div>
        <h3 class="text-sm font-medium mb-2">Price Range</h3>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="sr-only" for="min-price">Minimum Price</label>
            <input
              type="number"
              id="min-price"
              [formControl]="form.controls.minPrice"
              placeholder="Min"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label class="sr-only" for="max-price">Maximum Price</label>
            <input
              type="number"
              id="max-price"
              [formControl]="form.controls.maxPrice"
              placeholder="Max"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-sm font-medium mb-2">Availability</h3>
        <label class="flex items-center">
          <input
            type="checkbox"
            [formControl]="form.controls.inStock"
            class="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span class="ml-2 text-sm">In Stock Only</span>
        </label>
      </div>

      <div>
        <h3 class="text-sm font-medium mb-2">Sort By</h3>
        <select
          [formControl]="form.controls.sortBy"
          class="w-full px-3 py-2 border rounded-md"
        >
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
        </select>
      </div>
    </div>
  `
})
export class ProductFiltersComponent {
  private fb = inject(FormBuilder);
  private productStore = inject(ProductStore);

  form = this.fb.group({
    minPrice: [null],
    maxPrice: [null],
    inStock: [false],
    sortBy: ['price_asc']
  });

  constructor() {
    // Update filters when form changes
    this.form.valueChanges.subscribe(filters => {
      this.productStore.setFilters(filters);
    });
  }
}