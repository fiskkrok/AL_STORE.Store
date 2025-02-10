// src/app/features/products/components/product-filters/product-filters.component.ts
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GetProductsRequest } from '../../core/models/product.model';
import { ProductStore } from '../../core/state/product.store';

interface ActiveFilter {
  id: string;
  label: string;
  type: 'search' | 'category' | 'price' | 'stock' | 'sort';
}

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="bg-card border rounded-lg p-4 lg:p-6 space-y-6">
      <!-- Mobile Filter Button -->
      <button 
        class="lg:hidden w-full flex items-center justify-between p-2 border rounded-md"
        (click)="showMobileFilters = !showMobileFilters"
      >
        <span class="text-sm font-medium">Filters</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          [class.rotate-180]="showMobileFilters"
          class="transition-transform duration-200"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      <!-- Filter Content -->
      <div 
        class="space-y-6"
        [class.hidden]="!showMobileFilters"
        [class.lg:block]="true"
      >
        <!-- Search -->
        <div class="form-group">
          <label for="search" class="form-label">Search</label>
          <div class="relative">
           <input
        id="search" type="search"
        [formControl]="searchControl"
        class="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary
               focus:border-transparent bg-background"
        placeholder="Search products..."
      >
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
      </svg>
          </div>
        </div>

        <!-- Categories -->
        <!-- <div class="form-group">
          <label class="form-label">Categories</label>
          <div class="space-y-2">
            @for (category of categories(); track category.id) {
              <label class="flex form-label items-center">
                <input
                  type="checkbox"
                  [value]="category.id"
                  [checked]="selectedCategories.includes(category.id)"
                  (change)="onCategoryChange($event)"
                  [disabled]="category.disabled"
                  class="form-checkbox"
                >
                <span class="ml-2 text-sm">
                  {{ category.name }}
                  <span class="text-muted-foreground">({{ category.count }})</span>
                </span>
              </label>
            }
          </div>
        </div> -->

        <!-- Price Range -->
        <div class="form-group">
          <label class="form-label" for="minPriceControl">Price Range</label>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <input
              id="minPriceControl"
                type="number"
                [formControl]="minPriceControl"
                placeholder="Min"
                class="form-input"
              >
            </div>
            <div>
              <input
                type="number"
                [formControl]="maxPriceControl"
                placeholder="Max"
                class="form-input"
              >
            </div>
          </div>
          @if (priceRange(); as range) {
            <div class="mt-2 text-sm text-muted-foreground">
              Range: {{ range.min | currency }} - {{ range.max | currency }}
            </div>
          }
        </div>

        <!-- Stock Status -->
        <div class="form-group">
          <label  class="form-label flex items-center">
            <input
              type="checkbox"
              [formControl]="inStockControl"
              class="form-checkbox"
            >
            <span class="ml-2 text-sm font-medium">In Stock Only</span>
          </label>
        </div>

        <!-- Sort -->
        <div class="form-group">
          <label class="form-label" for="sortControl" >Sort By</label>
          <select
            id="sortControl"
            [formControl]="sortControl"
            class="form-select"
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        <!-- Active Filters -->
        @if (hasActiveFilters()) {
          <div class="border-t pt-6">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Active Filters</span>
              <button
                class="text-sm text-primary hover:text-primary/90"
                (click)="clearFilters()"
              >
                Clear All
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              @for (filter of activeFilters(); track filter.id) {
                <button
                  class="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 
                         text-primary rounded-md text-sm hover:bg-primary/20"
                  (click)="removeFilter(filter)"
                >
                  {{ filter.label }}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProductFiltersComponent {
  private store = inject(ProductStore);

  // UI state
  showMobileFilters = false;
  selectedCategories: string[] = [];

  // Form controls
  searchControl = new FormControl('');
  minPriceControl = new FormControl<number | null>(null);
  maxPriceControl = new FormControl<number | null>(null);
  inStockControl = new FormControl(false);
  sortControl = new FormControl<GetProductsRequest['sortBy']>('newest');

  // Store selectors
  // categories = this.store.availableCategories;
  priceRange = this.store.priceRange;

  // Active filters computation
  activeFilters = computed(() => {
    const filters: ActiveFilter[] = [];

    if (this.searchControl.value) {
      filters.push({
        id: 'search',
        label: `Search: ${this.searchControl.value}`,
        type: 'search'
      });
    }

    // this.selectedCategories.forEach(catId => {
    //   const category = this.categories().find(c => c.id === catId);
    //   if (category) {
    //     filters.push({
    //       id: `category-${category.id}`,
    //       label: category.name,
    //       type: 'category'
    //     });
    //   }
    // });

    if (this.minPriceControl.value !== null) {
      filters.push({
        id: 'min-price',
        label: `Min: ${this.minPriceControl.value}`,
        type: 'price'
      });
    }

    if (this.maxPriceControl.value !== null) {
      filters.push({
        id: 'max-price',
        label: `Max: ${this.maxPriceControl.value}`,
        type: 'price'
      });
    }

    if (this.inStockControl.value) {
      filters.push({
        id: 'in-stock',
        label: 'In Stock Only',
        type: 'stock'
      });
    }

    return filters;
  });

  hasActiveFilters = computed(() => this.activeFilters().length > 0);

  constructor() {
    this.setupControlSubscriptions();
  }

  private setupControlSubscriptions(): void {
    // Search
    this.searchControl.valueChanges.pipe(
      takeUntilDestroyed(),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.updateFilters({ search: term || '' });
    });

    // Price range
    this.minPriceControl.valueChanges.pipe(
      takeUntilDestroyed(),
      debounceTime(300)
    ).subscribe(value => {
      this.updateFilters({ minPrice: value || undefined });
    });

    this.maxPriceControl.valueChanges.pipe(
      takeUntilDestroyed(),
      debounceTime(300)
    ).subscribe(value => {
      this.updateFilters({ maxPrice: value || undefined });
    });

    // Stock status
    this.inStockControl.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe(checked => {
      this.updateFilters({ inStock: checked || undefined });
    });

    // Sort
    this.sortControl.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe(value => {
      this.updateFilters({ sortBy: value || undefined });
    });
  }

  onCategoryChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const categoryId = checkbox.value;

    if (checkbox.checked) {
      this.selectedCategories = [...this.selectedCategories, categoryId];
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }

    this.updateFilters({ categories: this.selectedCategories });
  }

  removeFilter(filter: ActiveFilter): void {
    switch (filter.type) {
      case 'search':
        this.searchControl.setValue('');
        break;
      case 'category':
        this.selectedCategories = this.selectedCategories
          .filter(id => !filter.id.includes(id));
        this.updateFilters({ categories: this.selectedCategories });
        break;
      case 'price':
        if (filter.id === 'min-price') {
          this.minPriceControl.setValue(null);
        } else {
          this.maxPriceControl.setValue(null);
        }
        break;
      case 'stock':
        this.inStockControl.setValue(false);
        break;
    }
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.minPriceControl.setValue(null);
    this.maxPriceControl.setValue(null);
    this.inStockControl.setValue(false);
    this.sortControl.setValue('newest');
    this.selectedCategories = [];
  }

  private updateFilters(updates: Partial<GetProductsRequest>): void {
    this.store.setFilter(updates);
  }
}