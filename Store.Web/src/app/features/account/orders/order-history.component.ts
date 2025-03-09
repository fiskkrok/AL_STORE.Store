import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CustomerService } from '../../../core/services/customer.service';
import { OrderHistory } from '../../../shared/models';
import { OrderService } from '../../../core/services/order.service';
import { Router } from '@angular/router';
import { OrderHistoryCardComponent } from './order-history-card.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [OrderHistoryCardComponent],
  template: `
    <div class="container mx-auto px-4 py-8 text-foreground">
      <h1 class="text-2xl font-bold mb-8">Order History</h1>
      
      @if(orderHistory().length === 0) {
        <div class="text-center py-12 bg-gray-50 rounded-lg">
          <p class="text-muted-foreground">No orders found.</p>
          <button 
            class="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            (click)="loadOrderHistory()">
            Refresh
          </button>
        </div>
      } @else {
        <div class="space-y-4">
          @for (order of orderHistory(); track order.orderNumber) {
            <app-order-history-card 
              [order]="order"
              (viewOrderDetails)="navigateToOrderDetails($event)">
            </app-order-history-card>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderHistoryComponent {
  customerService = inject(CustomerService);
  orderService = inject(OrderService);
  router = inject(Router);

  orderHistory = signal<OrderHistory[]>([]);

  caching = computed(() => {
    // Store the orders in local storage (Maybe should be stored in reddis using the backend instead)
    // This is a temporary solution to avoid hitting the API every time
    const orders = this.orderHistory();
    localStorage.setItem('orderHistory', JSON.stringify([...orders]));
  });

  constructor() {
    this.loadOrderHistory();
  }

  loadOrderHistory() {
    // First try and get from local storage
    const cachedOrders = localStorage.getItem('orderHistory');
    if (cachedOrders) {
      this.orderHistory.set(JSON.parse(cachedOrders));
    }

    // If no cached orders, fetch from the server
    this.orderService.getCustomerOrders().subscribe({
      next: (orders) => {
        const orderHistory = orders;
        this.orderHistory.set(orderHistory);
      },
      error: (error) => {
        console.error('Error loading order history:', error);
      }
    });
  }

  navigateToOrderDetails(order: OrderHistory) {
    this.router.navigate(['/account/orders', order.id]);
  }
}
