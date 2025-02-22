// src/app/core/components/error-display/error-display.component.ts
import { Component, inject } from '@angular/core';
import { ErrorService } from '../../services/error.service';
import { AppError } from '../../../shared/models/error.model';
import { fadeAnimation } from '../../animations/fade.animation/fade.animation';

@Component({
  selector: 'app-error-display',
  standalone: true,
  animations: [fadeAnimation],
  template: `
    @if (hasErrors()) {
      <div class="fixed top-4 right-4 z-50 space-y-2 min-w-[320px] max-w-[420px]">
        @for (error of errors(); track error.timestamp) {
          <div 
            @fade
            class="flex items-start p-4 rounded-lg shadow-lg border"
            [class]="getErrorClasses(error)"
            role="alert"
          >
            <!-- Icon -->
            <div class="flex-shrink-0 mr-3">
              @switch (error.severity) {
                @case ('info') {
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                }
                @case ('warning') {
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
                  </svg>
                }
                @case ('error') {
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m15 9-6 6M9 9l6 6"/>
                  </svg>
                }
                @case ('fatal') {
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                }
              }
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              @if (error.code) {
                <p class="text-sm font-medium">
                  {{ error.code }}
                </p>
              }
              <p class="text-sm">{{ error.message }}</p>
              @if (error.severity === 'fatal') {
                <button 
                  class="mt-2 text-sm underline hover:no-underline"
                  (click)="reloadPage()"
                >
                  Reload Page
                </button>
              }
            </div>

            <!-- Close Button -->
            <button 
              class="flex-shrink-0 ml-3 hover:opacity-70"
              (click)="removeError(error)"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        }
      </div>
    }
  `
})
export class ErrorDisplayComponent {
  private errorService = inject(ErrorService);

  errors = this.errorService.currentErrors;
  hasErrors = this.errorService.hasErrors;

  getErrorClasses(error: AppError): string {
    const baseClasses = 'border-l-4';

    switch (error.severity) {
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-500 text-blue-700`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-700`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-500 text-red-700`;
      case 'fatal':
        return `${baseClasses} bg-red-100 border-red-700 text-red-900`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-500 text-gray-700`;
    }
  }

  removeError(error: AppError) {
    this.errorService.removeError(error);
  }

  reloadPage() {
    window.location.reload();
  }
}