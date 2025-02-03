// src/app/features/checkout/checkout.component.ts
import { Component, computed, effect, inject, signal } from '@angular/core';
import { CartStore } from '../../core/state/cart.store';
import { CheckoutService } from '../../core/services/checkout.service';
import { ErrorService } from '../../core/services/error.service';
import { klarnaHelpers } from '../../core/config/klarna.config';
import { firstValueFrom } from 'rxjs';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Order Summary -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">Order Summary</h2>
          
          @for (item of cartItems(); track item.id) {
            <div class="flex items-center gap-4 border-b py-4">
              <img [src]="item.imageUrl" [alt]="item.name" 
                   class="w-20 h-20 object-cover rounded">
              <div class="flex-1">
                <h3 class="font-medium">{{ item.name }}</h3>
                <p class="text-sm text-muted-foreground">
                  Quantity: {{ item.quantity }}
                </p>
                <p class="font-medium">
                  {{ item.price * item.quantity | currency:'SEK' }}
                </p>
              </div>
            </div>
          }

          <div class="border-t pt-4 space-y-2">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span>{{ subtotal() | currency:'SEK' }}</span>
            </div>
            <div class="flex justify-between">
              <span>VAT (25%)</span>
              <span>{{ tax() | currency:'SEK' }}</span>
            </div>
            <div class="flex justify-between font-bold">
              <span>Total</span>
              <span>{{ total() | currency:'SEK' }}</span>
            </div>
          </div>
        </div>

        <!-- Klarna Checkout -->
        <div>
          @if (loading()) {
            <div class="flex items-center justify-center h-64">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }

          <div id="klarna-payments-container"></div>

          @if (error()) {
            <div class="p-4 bg-red-50 text-red-700 rounded-lg">
              {{ error() }}
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent {
  private cartStore = inject(CartStore);
  private checkoutService = inject(CheckoutService);
  private errorService = inject(ErrorService);

  cartItems = this.cartStore.cartItems;
  subtotal = this.cartStore.totalPrice;
  tax = computed(() => klarnaHelpers.calculateTax(this.subtotal()));
  total = computed(() => this.subtotal() + this.tax());

  loading = signal(false);
  error = signal<string | null>(null);
  sessionId: string | null = null;
  router: any;

  constructor() {
    // Initialize Klarna when cart items change
    effect(() => {
      const items = this.cartItems();
      if (items.length > 0) {
        this.initKlarnaCheckout();
      }
    });
  }

  private async initKlarnaCheckout() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const session = await firstValueFrom(
        this.checkoutService.createKlarnaSession(this.cartItems())
      );

      // Initialize Klarna
      await this.loadKlarnaScript();
      if (window.Klarna) {
        window.Klarna.Payments.init({
          client_token: session.clientToken
        });


        window.Klarna.Payments.load({
          container: '#klarna-payments-container',
          payment_method_category: session.paymentMethods[0]?.identifier
        }, {}, (res) => {
          if (!res.show_form) {
            this.error.set('Klarna payment is not available at this time');
          }
        });
      } else {
        this.error.set('Klarna is not available at this time');
      }
    } catch (err) {
      this.error.set('Failed to initialize checkout. Please try again.');
      this.errorService.addError(
        'CHECKOUT_ERROR',
        'Failed to initialize checkout',
        { severity: 'error', context: { error: err } }
      );
    } finally {
      this.loading.set(false);
    }
  }

  private loadKlarnaScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Klarna) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://x.klarnacdn.net/kp/lib/v1/api.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }
  async initiatePayment() {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Call authorize on Klarna SDK
      await new Promise<void>((resolve, reject) => {
        window.Klarna?.Payments.authorize({}, {}, async (response) => {
          if (!response.approved) {
            reject(new Error(response.error?.message || 'Payment not approved'));
            return;
          }

          try {
            // Backend handles the actual authorization
            const result = await firstValueFrom(
              this.checkoutService.authorizePayment({
                sessionId: this.sessionId,
                // Add any additional data needed
              })
            );

            if (result.success) {
              // Navigate to confirmation page
              this.router.navigate(['/checkout/confirmation'], {
                queryParams: { orderId: result.orderId }
              });
            } else {
              reject(new Error(result.error || 'Authorization failed'));
            }
          } catch (err) {
            reject(err);
          }
        });
      });
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Payment failed');
      this.errorService.addError('PAYMENT_ERROR', 'Failed to process payment', {
        severity: 'error',
        context: { error: err }
      });
    } finally {
      this.loading.set(false);
    }
  }
}



// Backend Requirements:

// Payment Session Management


// Create payment sessions with Klarna
// Store session information securely
// Handle session timeouts / expiration
// Validate session status


// Payment Processing


// Store Klarna API credentials securely
// Handle payment authorizations
// Process payment completions
// Manage payment failures / retries


// Order Management


// Create and store orders
// Track order statuses
// Link orders to Klarna references
// Handle order updates


// Webhook Handling


// Receive Klarna callbacks / webhooks
// Update order statuses based on webhooks
// Handle payment status changes
// Process refunds if needed


// Security Requirements


// Secure storage of Klarna credentials
// HTTPS endpoints
// Request validation
// Rate limiting for payment endpoints
// CSRF protection
// Input sanitization


// Required API Endpoints:

// CopyPOST / api / checkout / sessions
//   - Creates a new Klarna payment session
//     - Returns client token for frontend

// POST / api / checkout / authorize
//   - Handles payment authorization
//     - Validates payment details
//       - Returns success / failure status

// POST / api / checkout / complete
//   - Completes the order
//     - Updates order status
//       - Returns order confirmation

// POST / api / webhook / klarna
//   - Receives Klarna callbacks
//     - Updates order statuses

// Error Handling


// Payment failures
// Session timeouts
// Network issues
// Invalid requests
// Fraud detection
// Logging of all payment - related events