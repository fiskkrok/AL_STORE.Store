import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CustomerService } from '../../core/services/customer.service';
import { OrderSummary } from '../../shared/models';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
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
        <div  class="mb-6">
          <div class="bg-background rounded-lg border p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">Order #{{ order.orderNumber }}</h2>
              <span class="text-sm text-muted-foreground">{{ order.created | date }}</span>
            </div>
              <div class="space-y-4">
                @for (item of order.items; track $index) {
                <div class="flex justify-between items-center">
                  <div class="flex items-center">
                    <span class="font-medium">{{ item.name }}</span>
                    <span class="text-muted-foreground ml-2">×{{ item.quantity }}</span>
                  </div>
                  <span>{{ item.price * item.quantity | currency }}</span>
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
                      <p>{{ order.shippingAddress.firstName + order.shippingAddress.lastName }}</p>
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
  orderHistory = signal<OrderSummary[]>([]);
  constructor() {
    this.loadOrderHistory();
  }
  loadOrderHistory() {
    this.orderService.getCustomerOrders().subscribe({
      next: (orders) => {
        this.orderHistory.set(orders);
      },
      error: (error) => {
        console.error('Error loading order history:', error);
      }
    });
  }
}
