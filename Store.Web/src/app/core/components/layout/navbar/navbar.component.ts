import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartStore } from '../../../state/cart.store';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center">
        <div class="mr-4 flex">
          <a class="mr-6 flex items-center space-x-2" href="/">
            <span class="font-bold">STORE</span>
          </a>
          
          <nav class="flex items-center space-x-6 text-sm font-medium">
            <a 
              class="transition-colors hover:text-foreground/80" 
              routerLink="/"
              routerLinkActive="text-foreground"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              Home
            </a>
            <a 
              class="transition-colors hover:text-foreground/80" 
              routerLink="/products"
              routerLinkActive="text-foreground"
            >
              Products
            </a>
          </nav>
        </div>

        <div class="flex flex-1 items-center justify-end space-x-4">
          <div>
            <button 
              class="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-full"
              (click)="toggleTheme()"
            >
              @if (isDarkTheme()) {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              }
            </button>
          </div>

          <a 
            class="relative inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-full"
            routerLink="/cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            @if (cartItemCount() > 0) {
              <span class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                {{cartItemCount()}}
              </span>
            }
          </a>

          <a 
            class="relative inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-full"
            routerLink="/account"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
          </a>
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  private cartStore = inject(CartStore);
  cartItemCount = this.cartStore.totalItems;

  private theme = signal<'light' | 'dark'>('light');
  isDarkTheme = computed(() => this.theme() === 'dark');

  toggleTheme() {
    this.theme.update((current: string) => {
      const newTheme = current === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark');
      return newTheme;
    });
  }
}