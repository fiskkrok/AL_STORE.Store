// src/app/features/checkout/confirmation.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { CartStore } from '../../core/state/cart.store';
import { CheckoutStateService } from '../../core/services/checkout-state.service';
import { EmailService } from '../../core/services/email.service';
import { OrderConfirmation } from '../../shared/models/order.model';
import { CurrencyPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="container mx-auto py-8">
      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
        </div>
      } @else if (orderDetails()) {
        <div class="bg-background rounded-lg border p-6 max-w-3xl mx-auto">
          <!-- Success Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold">Order Confirmed!</h1>
            <p class="text-muted-foreground">
              Thank you for your purchase. Your order number is <span class="font-semibold">{{ orderDetails()?.orderNumber }}</span>
            </p>
            <p class="text-sm text-muted-foreground mt-1">
              A confirmation email has been sent to {{ orderDetails()?.customerEmail }}
            </p>
          </div>
          
          <!-- Order Items -->
          <div class="border-t pt-6 pb-4">
            <h2 class="font-semibold text-lg mb-4">Order Summary</h2>
            <div class="space-y-4">
              @for (item of orderDetails()?.items; track item.productId) {
                <div class="flex justify-between items-center">
                  <div class="flex items-center">
                    <span class="font-medium">{{ item.name }}</span>
                    <span class="text-muted-foreground ml-2">×{{ item.quantity }}</span>
                  </div>
                  <span>{{ item.price * item.quantity | currency }}</span>
                </div>
              }
            </div>
          </div>
          
          <!-- Total -->
          <div class="border-t border-b py-4 my-4">
            <div class="flex justify-between items-center font-bold">
              <span>Total</span>
              <span>{{ orderDetails()?.total | currency }}</span>
            </div>
          </div>
          
          <!-- Shipping Info -->
          <div class="mt-8">
            <h2 class="font-semibold text-lg mb-2">Shipping Address</h2>
            @if (orderDetails()?.shippingAddress) {
              <div class="text-sm text-muted-foreground">
                <p>{{ orderDetails()?.shippingAddress.firstName }} {{ orderDetails()?.shippingAddress.lastName }}</p>
                <p>{{ orderDetails()?.shippingAddress.street }}</p>
                <p>{{ orderDetails()?.shippingAddress.city }}, {{ orderDetails()?.shippingAddress.postalCode }}</p>
                <p>{{ orderDetails()?.shippingAddress.country }}</p>
              </div>
            }
          </div>
          
          <!-- Actions -->
          <div class="mt-8 flex justify-center space-x-4">
            <a routerLink="/" class="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
              Continue Shopping
            </a>
            <a routerLink="/account/orders" class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              View All Orders
            </a>
          </div>
        </div>
      } @else {
        <div class="text-center py-12 bg-background rounded-lg border max-w-md mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 class="mt-4 text-xl font-semibold">Order Not Found</h2>
          <p class="mt-2 text-muted-foreground">
            We couldn't find your order information. Please check your email for confirmation.
          </p>
          <button (click)="retryLoadOrder()" class="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Try Again
          </button>
        </div>
      }
    </div>
  `
})
export class OrderConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly cartStore = inject(CartStore);
  private readonly checkoutState = inject(CheckoutStateService);
  private readonly emailService = inject(EmailService);

  loading = signal(true);
  orderDetails = signal<OrderConfirmation | null>(null);
  error = signal<string | null>(null);

  ngOnInit() {
    const orderId = this.route.snapshot.queryParams['orderId'];
    const paymentSessionId = this.route.snapshot.queryParams['sessionId'];

    if (orderId) {
      this.loadOrderDetails(orderId);
    } else if (paymentSessionId) {
      this.createOrderFromSession(paymentSessionId);
    } else {
      this.loading.set(false);
      this.error.set('No order information provided');
    }
  }

  private loadOrderDetails(orderNumber: string) {
    this.orderService.getOrderById(orderNumber).subscribe({
      next: (order) => {
        if (order) {
          this.orderDetails.set(order);
          // Clear cart and checkout state since order is complete
          this.cartStore.clearCart();
          this.checkoutState.clearCheckoutState();
        } else {
          this.error.set('Order not found');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load order details');
        this.loading.set(false);
      }
    });
  }

  private createOrderFromSession(sessionId: string) {
    // For our testing flow: create a mock order
    const cartItems = this.cartStore.cartItems();
    const paymentMethod = this.checkoutState.getSelectedPaymentMethod() || 'unknown';

    if (environment.useRealApi) {
      // Use real API for order creation
      this.orderService.createOrder(sessionId, cartItems).subscribe({
        next: (order) => {
          this.orderDetails.set(order);
          this.sendConfirmationEmail(order);
          this.cartStore.clearCart();
          this.checkoutState.clearCheckoutState();
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to create order');
          this.loading.set(false);
        }
      });
    } else {
      // Create a mock order for testing
      setTimeout(() => {
        const mockOrder = this.orderService.createMockOrder(cartItems, paymentMethod);
        this.orderDetails.set(mockOrder);
        this.sendConfirmationEmail(mockOrder);
        this.cartStore.clearCart();
        this.checkoutState.clearCheckoutState();
        this.loading.set(false);
      }, 1500); // Simulate API delay
    }
  }

  private sendConfirmationEmail(order: OrderConfirmation) {
    // In a real app, this would be handled by the backend
    // But for testing, we can simulate it
    if (environment.useRealApi) {
      return; // Email is sent by the backend
    }

    this.emailService.sendOrderConfirmation(order).subscribe({
      next: () => console.log('Confirmation email sent'),
      error: (err) => console.error('Failed to send confirmation email', err)
    });
  }

  retryLoadOrder() {
    const orderId = this.route.snapshot.queryParams['orderId'];
    if (orderId) {
      this.loading.set(true);
      this.loadOrderDetails(orderId);
    } else {
      this.router.navigate(['/']);
    }
  }
}