import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderHistory, OrderLineItem, CheckoutAddress } from '../../../shared/models';
import { OrderService, OrderDetailDto } from '../../../core/services/order.service';
import { map, switchMap, of } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-order-history-details',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8 text-foreground">
      <!-- Back button -->
      <button 
        class="mb-6 flex items-center text-sm text-muted-foreground hover:text-foreground"
        (click)="navigateBack()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Order History
      </button>
      
      @if(order) {
        <!-- Order header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold">Order Details</h1>
          <p class="text-muted-foreground">Order #{{ order.orderNumber }}</p>
        </div>
        
        <div class="bg-background rounded-lg border p-6">
          <!-- Order summary -->
          <div class="flex justify-between items-center mb-6">
            <div>
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
            <span class="text-sm text-muted-foreground">{{ order.created | date:'medium' }}</span>
          </div>
          
          <!-- Order items -->
          <h2 class="font-semibold text-lg mb-4">Items</h2>
          <div class="space-y-4 mb-6">
            @for (item of order.orderLineItems; track $index) {
              <div class="flex justify-between items-center py-4 border-b">
                <div class="flex items-center">
                  <img src="{{ item.productImageUrl }}" alt="{{ item.productName }}" class="w-16 h-16 rounded-md mr-4">
                  <!-- <img src="{{ item.productImageUrl }}" alt="{{ item.productName }}" class="w-16 h-16 rounded-md mr-4"> -->
                  <div>
                    <div class="font-medium">
                      <a [routerLink]="['/products', item.productId]" class="hover:text-primary hover:underline">{{ item.productName }}</a>
                    </div>
                    <div class="text-sm text-muted-foreground">Quantity: {{ item.quantity }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div>{{ item.unitPrice | currency }}</div>
                  <div class="text-sm text-muted-foreground">{{ (item.unitPrice * item.quantity) | currency }}</div>
                </div>
              </div>
            }
          </div>
          
          <!-- Order totals -->
          <div class="border-t py-4 my-4">
            <div class="flex justify-between items-center font-bold">
              <span>Total</span>
              <span>{{ order.totalAmount | currency }}</span>
            </div>
          </div>
          
          <!-- Shipping address -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <h2 class="font-semibold text-lg mb-2">Shipping Address</h2>
              <div class="bg-gray-50 p-4 rounded-md">
                <p>{{ order.shippingAddress.firstName + ' ' + order.shippingAddress.lastName }}</p>
                <p>{{ order.shippingAddress.street }}</p>
                <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postalCode }}</p>
                <p>{{ order.shippingAddress.country }}</p>
              </div>
            </div>
            
            @if(order.billingAddress) {
              <div>
                <h2 class="font-semibold text-lg mb-2">Billing Address</h2>
                <div class="bg-gray-50 p-4 rounded-md">
                  <p>{{ order.billingAddress.firstName + ' ' + order.billingAddress.lastName }}</p>
                  <p>{{ order.billingAddress.street }}</p>
                  <p>{{ order.billingAddress.city }}, {{ order.billingAddress.state }} {{ order.billingAddress.postalCode }}</p>
                  <p>{{ order.billingAddress.country }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="text-center py-12 bg-gray-50 rounded-lg">
          <p class="text-muted-foreground">Loading order details...</p>
          @if(error) {
            <p class="text-red-500 mt-2">{{ error }}</p>
            <button 
              class="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              (click)="loadOrder()">
              Try Again
            </button>
          }
        </div>
      }
    </div>
  `
})
export class OrderHistoryDetailsComponent implements OnInit {

  productService = inject(ProductService);

  orderService = inject(OrderService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  order: OrderHistory | null = null;
  error: string | null = null;
  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder(): void {
    this.error = null;

    this.route.paramMap.pipe(
      switchMap(params => {
        const orderId = params.get('id');
        if (!orderId) {
          throw new Error('Order ID not provided');
        }

        // First check local storage
        const cachedOrders = localStorage.getItem('orderHistory');
        if (cachedOrders) {
          const orders: OrderHistory[] = JSON.parse(cachedOrders);
          const cachedOrder = orders.find(order => order.id === orderId);
          if (cachedOrder) {
            return of(cachedOrder);
          }
        }

        // If not found in cache, fetch from API
        return this.orderService.getCustomerOrderById(orderId).pipe(
          map(orderDetailDto => {
            if (!orderDetailDto) return null;

            // Convert OrderDetailDto to OrderHistory format
            return this.convertOrderDetailDtoToOrderHistory(orderDetailDto);
          })
        );
      })
    ).subscribe({
      next: (orderData) => {
        if (orderData) {
          this.order = orderData;
        } else {
          this.error = 'Order not found';
        }
      },
      error: (err) => {
        console.error('Failed to load order:', err);
        this.error = 'Failed to load order details. Please try again.';
      }
    });
  }

  /**
   * Convert the API OrderDetailDto to the OrderHistory format used by the UI
   */
  private convertOrderDetailDtoToOrderHistory(dto: OrderDetailDto): OrderHistory {
    // Convert shipping address to CheckoutAddress format
    const shippingAddress: CheckoutAddress = {
      id: '',
      firstName: dto.shippingAddress.firstName,
      lastName: dto.shippingAddress.lastName,
      street: dto.shippingAddress.street,
      city: dto.shippingAddress.city,
      state: dto.shippingAddress.state || '',
      postalCode: dto.shippingAddress.postalCode,
      country: dto.shippingAddress.country,
      email: dto.shippingAddress.email,
      type: 'shipping',
      isDefault: false
    };

    // Convert billing address if present
    let billingAddress: CheckoutAddress | undefined;
    if (dto.billingAddress) {
      billingAddress = {
        id: '',
        firstName: dto.billingAddress.firstName,
        lastName: dto.billingAddress.lastName,
        street: dto.billingAddress.street,
        city: dto.billingAddress.city,
        state: dto.billingAddress.state || '',
        postalCode: dto.billingAddress.postalCode,
        country: dto.billingAddress.country,
        email: dto.billingAddress.email,
        type: 'billing',
        isDefault: false
      };
    }

    // Convert order items to OrderLineItem format
    const orderLineItems: OrderLineItem[] = dto.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      currency: 'SEK', // Default or could be specified in the DTO
      productImageUrl: item.productImageUrl || 'assets/Pics/1.webp'
    }));

    // Return the order in OrderHistory format
    return {
      id: dto.id,
      orderNumber: dto.orderNumber,
      created: dto.createdAt,
      status: dto.status,
      totalAmount: dto.totalAmount,
      currency: 'SEK', // Default or could be specified in the DTO
      itemCount: dto.items.length,
      orderLineItems: orderLineItems,
      shippingAddress: shippingAddress,
      billingAddress: billingAddress as CheckoutAddress // Type assertion as it's optional in OrderHistory
    };
  }

  navigateBack(): void {
    this.router.navigate(['/account/profile-management'], { queryParams: { tab: 'orders' } });
  }
}