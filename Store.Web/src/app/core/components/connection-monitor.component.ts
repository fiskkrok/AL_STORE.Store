import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { fromEvent, tap, interval, takeWhile, Subject, takeUntil } from 'rxjs';
import { SignalRService } from '../services/signalr.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connection-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!isOnline()) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <svg class="animate-spin h-8 w-8 mx-auto text-brand-navy mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-lg">Connection lost. Reconnecting...</p>
        </div>
      </div>
    }
    
    @if (apiConnectionError()) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
          <div class="mb-4 flex justify-center">
            <img src="assets/svg/alstore_blue_black.svg" alt="Server Connection Error" class="h-16 w-auto opacity-50"/>
          </div>
          <h3 class="text-xl font-semibold mb-2">Can't connect to server</h3>
          <p class="text-gray-600 mb-4">
            We're having trouble connecting to our servers. Will retry in {{ retryCountdown() }} seconds{{ loadingDots() }}
          </p>
          <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div class="bg-blue-600 h-2 rounded-full" [style.width.%]="retryProgressPercentage()"></div>
          </div>
        </div>
      </div>
    }
  `
})
export class ConnectionMonitorComponent implements OnInit, OnDestroy {
  private signalRService = inject(SignalRService);
  private destroy$ = new Subject<void>();
  private retryInterval = 10; // seconds

  isOnline = signal(true);
  apiConnectionError = signal(false);
  retryCountdown = signal(this.retryInterval);
  loadingDots = signal('');
  retryProgressPercentage = signal(100);

  ngOnInit() {
    // Monitor browser online/offline status
    fromEvent(window, 'online').pipe(
      tap(() => this.isOnline.set(true)),
      takeUntil(this.destroy$)
    ).subscribe();

    fromEvent(window, 'offline').pipe(
      tap(() => this.isOnline.set(false)),
      takeUntil(this.destroy$)
    ).subscribe();

    // Monitor API connection status
    this.signalRService.connectionState$.pipe(
      tap(connected => {
        this.apiConnectionError.set(!connected);
        if (!connected) {
          this.startRetryCountdown();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    // Animated loading dots
    interval(500).pipe(
      tap(() => {
        const dots = this.loadingDots();
        this.loadingDots.set(dots.length >= 3 ? '' : dots + '.');
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startRetryCountdown() {
    this.retryCountdown.set(this.retryInterval);
    this.retryProgressPercentage.set(100);

    interval(1000).pipe(
      takeWhile(() => this.retryCountdown() > 0 && this.apiConnectionError()),
      tap(() => {
        const current = this.retryCountdown();
        this.retryCountdown.set(current - 1);
        this.retryProgressPercentage.set((current - 1) / this.retryInterval * 100);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      complete: () => {
        if (this.apiConnectionError()) {
          // If still disconnected, restart countdown
          this.startRetryCountdown();
        }
      }
    });
  }
}
