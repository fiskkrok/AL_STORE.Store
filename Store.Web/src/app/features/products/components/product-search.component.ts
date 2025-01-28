// src/app/features/products/components/product-search/product-search.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductStore } from '../../../core/state/product.store';

@Component({
    selector: 'app-product-search',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="relative">
      <input
        type="search"
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

      @if (searchControl.value) {
        <button
          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground 
                 hover:text-foreground"
          (click)="clearSearch()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
               fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      }
    </div>
  `
})
export class ProductSearchComponent {
    private store = inject(ProductStore);

    searchControl = new FormControl('');

    constructor() {
        // Subscribe to search changes
        this.searchControl.valueChanges.pipe(
            takeUntilDestroyed(),
            debounceTime(300),
            distinctUntilChanged(),
            filter(term => term !== null)  // Handle undefined/null
        ).subscribe(term => {
            this.store.setFilter({ search: term || '' });
        });
    }

    clearSearch(): void {
        this.searchControl.setValue('');
    }
}