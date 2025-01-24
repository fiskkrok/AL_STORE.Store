import { Component, OnInit, signal } from '@angular/core';
import { fromEvent, tap } from 'rxjs';

@Component({
  selector: 'app-connection-monitor',
  standalone: true,
  template: `
    @if (!isOnline()) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <svg class="animate-spin h-8 w-8 mx-auto text-brand-navy mb-4" ...></svg>
          <p class="text-lg">Connection lost. Reconnecting...</p>
        </div>
      </div>
    }
  `
})
export class ConnectionMonitorComponent implements OnInit {
  isOnline = signal(true);

  ngOnInit() {
    fromEvent(window, 'online').pipe(
      tap(() => this.isOnline.set(true))
    ).subscribe();

    fromEvent(window, 'offline').pipe(
      tap(() => this.isOnline.set(false))
    ).subscribe();
  }
}
