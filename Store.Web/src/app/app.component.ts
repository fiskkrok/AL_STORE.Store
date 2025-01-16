import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ErrorDisplayComponent } from './core/components/error-display/error-display.component';
import { NavbarComponent } from './core/components/layout/navbar/navbar.component';
import { FooterComponent } from './core/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ErrorDisplayComponent],
  template: `
    <div class="relative min-h-screen bg-background font-sans antialiased">
      <div class="relative flex min-h-screen flex-col">
        <app-navbar />
        
        <main class="flex-1">
          <div class="container">
            <app-error-display />
            <router-outlet />
          </div>
        </main>

        <app-footer />
      </div>
    </div>
  `,
})
export class AppComponent {
  constructor() {
    // Initialize theme based on system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }
}