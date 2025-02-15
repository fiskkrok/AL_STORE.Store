

import { Component, inject, signal } from "@angular/core";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    @if (error()) {
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <p class="text-red-600">Authentication failed. Please try logging in again.</p>
          <button
            (click)="auth.login()"
            class="mt-4 px-4 py-2 bg-brand-navy text-white rounded-md"
          >
            Back to Login
          </button>
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <svg class="animate-spin h-8 w-8 mx-auto text-brand-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p class="mt-4 text-lg">Completing login...</p>
        </div>
      </div>
    }
  `
})
export class AuthCallbackComponent {
  auth = inject(AuthService);
  error = signal(false);

  constructor() {
    this.auth.handleAuthCallback();
  }
}