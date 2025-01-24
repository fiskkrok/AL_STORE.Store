
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 bg-black/60"
        (click)="close.emit()"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        (keydown.escape)="close.emit()"
        tabindex="-1" >
        <div class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
          (click)="$event.stopPropagation()"   tabindex="0" role="dialog" aria-labelledby="dialog-title" (keydown.space)="close.emit()" (keydown.enter)="close.emit()">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ title() }}</h2>
            <button 
              class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100" 
              (click)="close.emit()" tabindex="0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <!-- Content -->
          <div class="relative">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          @if (showFooter()) {
            <div class="flex items-center justify-end space-x-4">
              <button 
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                (click)="close.emit()"
              >
                Cancel
              </button>
              <button 
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                (click)="confirm.emit()"
              >
                {{ confirmText() }}
              </button>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  isOpen = input(false);
  title = input('');
  showFooter = input(true);
  confirmText = input('Confirm');

  close = output<void>();
  confirm = output<void>();
}
