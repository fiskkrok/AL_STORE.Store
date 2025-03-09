import { Component, EventEmitter, Output, input } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { OrderHistory } from '../../../shared/models';

@Component({
  selector: 'app-order-history-card',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass],
  template: `
    <div class="bg-background rounded-lg border p-6 cursor-pointer hover:shadow-md transition-shadow" (click)="viewOrderDetails.emit(order())">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-lg font-semibold">Order #{{ order().orderNumber }}</h2>
          <div class="mt-1">
            <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                  [ngClass]="{
                    'bg-green-50 text-green-700': order().status === 'Completed',
                    'bg-blue-50 text-blue-700': order().status === 'Processing',
                    'bg-amber-50 text-amber-700': order().status === 'Pending',
                    'bg-red-50 text-red-700': order().status === 'Cancelled'
                  }">
              {{ order().status || 'Pending' }}
            </span>
          </div>
        </div>
        <span class="text-sm text-muted-foreground">{{ order().created | date }}</span>
      </div>
      
      <!-- Order Summary -->
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm text-muted-foreground">{{ order().orderLineItems.length }} items</p>
        </div>
        <div class="text-right">
          <p class="font-medium">{{ order().totalAmount | currency }}</p>
        </div>
      </div>
      
      <!-- View Details Link -->
      <div class="mt-4 flex justify-end">
        <button 
          class="text-sm text-primary hover:underline flex items-center"
          (click)="$event.stopPropagation(); viewOrderDetails.emit(order())">
          View Details
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  `
})
export class OrderHistoryCardComponent {
  readonly order = input.required<OrderHistory>();
  @Output() viewOrderDetails = new EventEmitter<OrderHistory>();
}