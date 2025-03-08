import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CustomerService } from '../../core/services/customer.service';
import { OrderHistory } from '../../shared/models';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass],
  template: `
    <div class="container mx-auto px-4 py-8 text-foreground">
      <h1 class="text-2xl font-bold mb-8">Order History</h1>
      @if(orderHistory().length === 0) {
        <div  class="text-center">
          <p class="text-muted-foreground">No orders found.</p>
        </div>
      } @else {
        @for (order of orderHistory(); track order.orderNumber) 
          {
        <div class="mb-6">
          <div class="bg-background rounded-lg border p-6">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h2 class="text-lg font-semibold">Order #{{ order.orderNumber }}</h2>
                <div class="mt-1">
                  <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                        [ngClass]="{
                          'bg-green-50 text-green-700': order.status === 'Completed',
                          'bg-blue-50 text-blue-700': order.status === 'Processing',
                          'bg-amber-50 text-amber-700': order.status === 'Pending',
                          'bg-red-50 text-red-700': order.status === 'Cancelled'
                        }">
                    {{ order.status || 'Pending' }}
                  </span>
                </div>
              </div>
              <span class="text-sm text-muted-foreground">{{ order.created | date }}</span>
            </div>
              <div class="space-y-4">
                @for (item of order.orderLineItems; track $index) {
                <div class="flex justify-between items-center">
                  <div class="flex items-center">
                    <span class="font-medium">{{ item.productName }}</span>
                    <span class="text-muted-foreground ml-2">×{{ item.quantity }}</span>
                  </div>
                  <span>{{ item.unitPrice | currency }}</span>
                </div>
              }
              </div>
                <div class="border-t border-b py-4 my-4">
                  <div class="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span>{{ order.totalAmount | currency }}</span>
                  </div>
                </div>
                  <div class="mt-8">
                      <h2 class="font-semibold text-lg mb-2">Shipping Address</h2>
                      <p>{{ order.shippingAddress.firstName + ' ' + order.shippingAddress.lastName }}</p>
                      <p>{{ order.shippingAddress.street }}</p>
                       <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postalCode }}</p>

                      <p>{{ order.shippingAddress.country }}</p>
                  </div>
                </div>
        </div>
          }
            }
      </div>
      `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderHistoryComponent {
  customerService = inject(CustomerService);
  orderService = inject(OrderService);
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
    // Store the orders in local storage (Maybe should be stored in reddis using the backend instead)
    // This is a temporary solution to avoid hitting the API every time

  }
}
