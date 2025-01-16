import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div 
      class="flex items-center justify-center"
      [class.overlay]="overlay()"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      @if (message()) {
        <span class="ml-2">{{ message() }}</span>
      }
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 50;
    }
  `]
})
export class LoadingSpinnerComponent {
  overlay = input(false);
  message = input<string>('');
}