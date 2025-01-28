/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/core/components/layout/navbar.component.ts
import { NgIf, AsyncPipe } from '@angular/common';
import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { CartDropdownComponent } from '../../cart-dropdown/cart-dropdown.component';
import { CartStore } from '../../../state/cart.store';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, AsyncPipe, CartDropdownComponent],
  template: `
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center">
        <!-- Brand and Navigation -->
        <div class="mr-4 flex" >
          <a class="mr-6 flex items-center space-x-2 nav-link" href="/">
            <span class="font-bold">STORE</span>
          </a>
          
          <nav class="flex items-center space-x-6 text-sm font-medium">
            <a 
              class="nav-link" 
              routerLink="/"
              routerLinkActive="text-foreground"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              Home
            </a>
            <a 
              class="nav-link"
              routerLink="/products"
              routerLinkActive="text-foreground"
            >
              Products
            </a>
          </nav>
        </div>

        <!-- Right Side Actions -->
        <div class="flex flex-1 items-center justify-end space-x-4">
          <!-- Theme Toggle -->
          <div>
            <button 
              class="inline-flex items-center justify-center text-sm font-medium transition-colors h-10 w-10 rounded-full btn-secondary"
              (click)="toggleTheme()"
            >
              @if (isDarkTheme()) {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              }
            </button>
          </div>

          <!-- Cart -->
          <div class="relative cart-container">
            <button 
              class="btn-secondary inline-flex items-center justify-center text-sm font-medium transition-colors h-10 w-10 rounded-full hover:bg-accent"
              (click)="toggleCart()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              @if (cartItemCount() > 0) {
                <span class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                  {{cartItemCount()}}
                </span>
              }
            </button>

            <app-cart-dropdown [isOpen]="showCart()" />
          </div>

          <!-- Auth Section -->
          <ng-container *ngIf="auth.user$ | async as user; else loginButton">
            <div class="relative">
              <button
                class="flex items-center gap-2 hover:bg-accent p-2 rounded-lg btn-secondary"
                (click)="toggleUserMenu()"
              >
                <img
                  [src]="user.picture"
                  [alt]="user.name"
                  class="w-8 h-8 rounded-full"
                />
                <span class="text-sm">{{ user.name }}</span>
              </button>

              @if (showUserMenu()) {
                <div class="absolute right-0 mt-2 w-48 bg-background rounded-lg shadow-lg border py-1">
                  <a
                    routerLink="/account"
                    class="block px-4 py-2 text-sm hover:bg-accent"
                  >
                    Account Settings
                  </a>
                  <a
                    routerLink="/orders"
                    class="block px-4 py-2 text-sm hover:bg-accent"
                  >
                    Order History
                  </a>
                  <button
                    (click)="auth.logout()"
                    class="w-full text-left px-4 py-2 text-sm hover:bg-accent text-red-600"
                      class="w-full text-left px-4 py-2 text-sm hover:bg-accent text-red-600"
                  >
                    Sign Out
                  </button>
                </div>
              }
            </div>
          </ng-container>

          <ng-template #loginButton>
            <button
              (click)="auth.login()"
              class="inline-flex items-center justify-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md"
            >
              Sign In
            </button>
          </ng-template>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  private readonly cartStore = inject(CartStore);
  private autoHideTimeout: any;
  private themeService = inject(ThemeService);

  isDarkTheme = computed(() => this.themeService.currentTheme() === 'dark');
  cartItemCount = this.cartStore.totalItems;
  showCart = signal(false);
  showUserMenu = signal(false);

  constructor() {
    // Show cart dropdown when item is added
    effect(() => {
      const recentItem = this.cartStore.recentlyAddedItem();
      if (recentItem) {
        this.showCart.set(true);

        // Clear any existing timeout
        if (this.autoHideTimeout) {
          clearTimeout(this.autoHideTimeout);
        }

        // Set new timeout
        this.autoHideTimeout = setTimeout(() => {
          this.showCart.set(false);
        }, 3000);
      }
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleCart() {
    this.showCart.update(show => !show);
  }

  toggleUserMenu() {
    this.showUserMenu.update(show => !show);
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Check if click was outside cart dropdown
    const cartElement = (event.target as HTMLElement).closest('.cart-container');
    if (!cartElement) {
      this.showCart.set(false);
    }

    // Check if click was outside user menu
    const userMenuElement = (event.target as HTMLElement).closest('.user-menu-container');
    if (!userMenuElement) {
      this.showUserMenu.set(false);
    }
  }
}