import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./core/components/layout/navbar/navbar.component";
import { ConnectionMonitorComponent } from './core/components/connection-monitor/connection-monitor.component';
import { ErrorDisplayComponent } from './core/components/error-display/error-display.component';
import { FooterComponent } from './core/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ErrorDisplayComponent, ConnectionMonitorComponent],
  template: `
    <div class="relative min-h-screen bg-background font-sans antialiased">
      <div class="relative flex min-h-screen flex-col">
        <app-connection-monitor />
        <app-error-display />
        <app-navbar />
        <main class="flex-1">
          <router-outlet />
        </main>
        <app-footer />
      </div>
    </div>
  `
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