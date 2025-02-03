import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { CheckoutService } from "../../../core/services/checkout.service";
import { ErrorService } from "../../../core/services/error.service";
import { CartStore } from "../../../core/state/cart.store";

// src/app/features/checkout/confirmation/confirmation.component.ts
@Component({
  selector: 'app-checkout-confirmation',
  standalone: true,
  template: `
    <div class="container mx-auto px-4 py-8">
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <div class="animate-spin h-8 w-8 border-b-2 border-primary"></div>
        </div>
      } @else if (error()) {
        <div class="text-center py-8">
          <div class="mb-4 text-red-600">
            <svg class="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold mb-4">Payment Failed</h2>
          <p class="text-gray-600 mb-4">{{ error() }}</p>
          <button 
            class="btn btn-primary"
            (click)="retryPayment()"
          >
            Try Again
          </button>
        </div>
      } @else {
        <div class="text-center py-8">
          <div class="mb-4 text-green-600">
            <svg class="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold mb-4">Order Confirmed!</h2>
          <p class="text-gray-600 mb-4">
            Your order number is: {{ orderNumber() }}
          </p>
          <div class="space-y-2">
            <p>Thank you for your purchase!</p>
            <p>You will receive an email confirmation shortly.</p>
          </div>
          <div class="mt-8">
            <a routerLink="/" class="btn btn-primary">
              Continue Shopping
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class ConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private cartStore = inject(CartStore);
  private errorService = inject(ErrorService);

  loading = signal(true);
  error = signal<string | null>(null);
  orderNumber = signal<string | null>(null);

  ngOnInit() {
    const orderId = this.route.snapshot.queryParams['orderId'];
    if (!orderId) {
      this.error.set('Invalid order reference');
      this.loading.set(false);
      return;
    }

    this.completeOrder(orderId);
  }

  private async completeOrder(orderId: string) {
    try {
      const result = await firstValueFrom(
        this.checkoutService.completeOrder(orderId)
      );

      if (result.success) {
        this.orderNumber.set(result.orderConfirmation?.orderNumber || orderId);
        // Clear cart after successful order
        this.cartStore.clearCart();
      } else {
        this.error.set('Failed to confirm order');
      }
    } catch (err) {
      this.error.set('Unable to confirm order status');
      this.errorService.addError('ORDER_CONFIRMATION_ERROR',
        'Failed to confirm order', {
        severity: 'error',
        context: { orderId, error: err }
      }
      );
    } finally {
      this.loading.set(false);
    }
  }

  retryPayment() {
    this.router.navigate(['/checkout']);
  }
}