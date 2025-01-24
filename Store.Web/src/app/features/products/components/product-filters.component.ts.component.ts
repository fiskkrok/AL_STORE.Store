// src/app/features/products/components/product-filters.component.ts
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductStore } from '../../../core/state/product.store';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-background border rounded-lg p-4 lg:p-6">
      <!-- Mobile Filter Button -->
      <button 
        class="lg:hidden w-full flex items-center justify-between p-2 border rounded-md mb-4"
        (click)="toggleMobileFilters()"
      >
        <span class="text-sm font-medium">Filters</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
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
        <div>
          <label for="search" class="text-sm font-medium block mb-2">Search</label>
          <div class="relative">
            <input
              type="search"
              id="search"
              [formControl]="searchControl"
              placeholder="Search products..."
              class="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-navy"
            >
            <svg 
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
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

        <!-- Price Range -->
        <div>
          <label for="" class="text-sm font-medium block mb-2">Price Range</label>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                [formControl]="form.controls.minPrice"
                placeholder="Min"
                class="w-full px-3 py-2 border rounded-md"
              >
            </div>
            <div>
              <input
                type="number"
                [formControl]="form.controls.maxPrice"
                placeholder="Max"
                class="w-full px-3 py-2 border rounded-md"
              >
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div>
          <label for="" class="text-sm font-medium block mb-2">Categories</label>
          <div class="space-y-2">
            @for (category of categories(); track category.id) {
              <label class="flex items-center">
                <input
                  type="checkbox"
                  [value]="category.id"
                  (change)="onCategoryChange($event)"
                  [checked]="selectedCategories.includes(category.id)"
                  class="rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
                >
                <span class="ml-2 text-sm">{{ category.name }}</span>
              </label>
            }
          </div>
        </div>

        <!-- Stock Status -->
        <div>
          <label class="flex items-center">
            <input
              type="checkbox"
              [formControl]="form.controls.inStock"
              class="rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
            >
            <span class="ml-2 text-sm font-medium">In Stock Only</span>
          </label>
        </div>

        <!-- Sort -->
        <div>
          <label for="sort" class="text-sm font-medium block mb-2">Sort By</label>
          <select
            id="sort"
            [formControl]="form.controls.sortBy"
            class="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>

        <!-- Clear Filters -->
        <button
          class="w-full px-4 py-2 text-sm border border-brand-navy text-brand-navy rounded-md hover:bg-brand-navy hover:text-white transition"
          (click)="clearFilters()"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  `
})
export class ProductFiltersComponent {
  private fb = inject(FormBuilder);
  private productStore = inject(ProductStore);

  showMobileFilters = false;
  selectedCategories: string[] = [];

  // Form controls
  searchControl = this.fb.control('');
  form = this.fb.group({
    minPrice: [null],
    maxPrice: [null],
    inStock: [false],
    sortBy: ['newest']
  });

  // Store data
  categories = computed(() => this.productStore.availableCategories());

  constructor() {
    // Handle search input with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.productStore.setSearchQuery(term || '');
    });

    // Handle other filter changes
    this.form.valueChanges.subscribe(values => {
      this.productStore.updateFilters(values);
    });
  }

  toggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
  }

  onCategoryChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const categoryId = checkbox.value;

    if (checkbox.checked) {
      this.selectedCategories.push(categoryId);
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }

    this.productStore.setCategory(this.selectedCategories.length ? this.selectedCategories : null);
  }

  clearFilters() {
    this.searchControl.reset();
    this.form.reset({
      sortBy: 'newest'
    });
    this.selectedCategories = [];
    this.productStore.resetFilters();
  }
}