// src/app/features/checkout/test-payment-controls.component.ts
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockPaymentOptions } from '../../core/services/mock-payment.service';

@Component({
    selector: 'app-test-payment-controls',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="p-4 border border-yellow-300 bg-yellow-50 rounded-lg mt-8">
      <h3 class="font-bold text-yellow-800 mb-2">Test Payment Controls</h3>
      <p class="text-sm text-yellow-700 mb-4">
        Use these controls to simulate different payment scenarios.
      </p>
      
      <div class="space-y-3">
        <div class="flex items-center">
          <input type="checkbox" 
                 id="shouldSucceed" 
                 [ngModel]="options.shouldSucceed" 
                 (ngModelChange)="updateOptions('shouldSucceed', $event)"
                 class="h-4 w-4">
          <label for="shouldSucceed" class="ml-2 text-sm">Payment should succeed</label>
        </div>
        
        <div class="flex items-center">
          <input type="checkbox" 
                 id="simulateNetworkError" 
                 [ngModel]="options.simulateNetworkError" 
                 (ngModelChange)="updateOptions('simulateNetworkError', $event)"
                 class="h-4 w-4">
          <label for="simulateNetworkError" class="ml-2 text-sm">Simulate network error</label>
        </div>
        
        <div class="flex items-center">
          <input type="checkbox" 
                 id="simulateTimeout" 
                 [ngModel]="options.simulateTimeout" 
                 (ngModelChange)="updateOptions('simulateTimeout', $event)"
                 class="h-4 w-4">
          <label for="simulateTimeout" class="ml-2 text-sm">Simulate timeout</label>
        </div>
        
        <div class="flex items-center">
          <input type="checkbox" 
                 id="simulateExpiredSession" 
                 [ngModel]="options.simulateExpiredSession" 
                 (ngModelChange)="updateOptions('simulateExpiredSession', $event)"
                 class="h-4 w-4">
          <label for="simulateExpiredSession" class="ml-2 text-sm">Simulate expired session</label>
        </div>
      </div>
    </div>
  `
})
export class TestPaymentControlsComponent {
    options: MockPaymentOptions = {
        shouldSucceed: true,
        simulateNetworkError: false,
        simulateTimeout: false,
        simulateExpiredSession: false
    };

    @Output() optionsChanged = new EventEmitter<MockPaymentOptions>();

    updateOptions(key: keyof MockPaymentOptions, value: boolean): void {
        this.options = { ...this.options, [key]: value };
        this.optionsChanged.emit(this.options);
    }
}