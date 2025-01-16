import { Component, computed, inject } from '@angular/core';
import { ErrorService } from '../../services/error.service';
import { ApiError } from '../../models/error.model';

@Component({
  selector: 'app-error-display',
  standalone: true,
  template: `
    @if (hasErrors()) {
      <div class="fixed top-4 right-4 z-50 space-y-2">
        @for (error of errors(); track error.code) {
          <div 
            class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg"
            role="alert"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-bold">{{ error.code }}</p>
                <p>{{ error.message }}</p>
              </div>
              <button 
                class="ml-4 text-red-700 hover:text-red-900"
                (click)="removeError(error)"
              >
                ×
              </button>
            </div>
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

  removeError(error: ApiError) {
    this.errorService.removeError(error);
  }
}