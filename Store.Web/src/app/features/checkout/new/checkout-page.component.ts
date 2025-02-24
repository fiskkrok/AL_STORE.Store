import { Component, inject, computed, signal } from "@angular/core";
import { CheckoutStateService } from "../../../core/services/checkout-state.service";
import { CheckoutInformationComponent } from "./checkout-information.component";
import { CheckoutPaymentComponent } from "./checkout-payment.component";
import { OrderSummaryComponent } from "./order-summary.component";
import { CheckoutDeliveryComponent } from "./checkout-delivery.component";
import { ErrorService } from "../../../core/services/error.service";
import { PaymentProviderFactory } from "../../../core/providers/payment-provider.factory";
import { CartStore } from "../../../core/state";
import { Router } from "@angular/router";
import { TestPaymentControlsComponent } from "./test-payment-controls.component";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../../environments/environment";
import { MockPaymentService, MockPaymentOptions } from "../../../core/services/mock-payment.service";
import { PaymentRecoveryService, PaymentError } from "../../../core/services/payment-recovery.service";


// checkout-page.component.ts
// checkout-page.component.ts
@Component({
  selector: 'app-checkout-page',
  template: `
     <!-- Existing template with added test controls -->
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Main Checkout Flow -->
        <div class="lg:col-span-8 space-y-8">
          <!-- Shipping Section -->
          <section class="bg-background rounded-lg border p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold">1. Shipping Information</h2>
              @if (checkoutState.hasShippingInformation()) {
                <span class="text-green-600">✓ Complete</span>
              }
            </div>
            <app-checkout-information />
          </section>

          <!-- Payment Section -->
          @if (checkoutState.hasShippingInformation()) {
            <section class="bg-background rounded-lg border p-6">
              <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold">2. Payment</h2>
              <!-- Update condition to check for filled payment information -->
               @if (checkoutState.hasShippingInformation() && checkoutState.hasPaymentMethod()) {
                <span class="text-green-600">✓ Complete</span>
               }
            </div>
              <app-checkout-payment />
            </section>
          }
          
         @if (checkoutState.hasShippingInformation() && checkoutState.hasPaymentMethod()) {
            <section class="bg-background rounded-lg border p-6">
              <h2 class="text-xl font-semibold mb-4">3. Delivery Options</h2>
              <app-checkout-delivery />
            </section>
          }
          
          <!-- (click)="initiatePayment()" -->
         <button
            class="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            [disabled]="loading() || !isCheckoutComplete()"
            (click)="initiatePayment()"
          >
            @if (loading()) {
              <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Processing...
              </span>
            } @else {
              Complete Purchase
            }
          </button>

          <!-- Testing Controls (only in development) -->
          @if (!environment.production) {
            <app-test-payment-controls (optionsChanged)="updateTestOptions($event)" />
          }
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-4">
          <div class="sticky top-4">
            <app-order-summary />
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [OrderSummaryComponent, CheckoutDeliveryComponent, CheckoutPaymentComponent, CheckoutInformationComponent, TestPaymentControlsComponent]
})
export class CheckoutPageComponent {
  readonly checkoutState = inject(CheckoutStateService);
  private readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);
  private readonly paymentProviderFactory = inject(PaymentProviderFactory);
  private readonly paymentRecoveryService = inject(PaymentRecoveryService);
  private readonly mockPaymentService = inject(MockPaymentService);
  environment = environment;
  loading = signal(false);
  isCheckoutComplete = computed(() => this.checkoutState.isCheckoutComplete());
  testOptions: MockPaymentOptions = {
    shouldSucceed: true
  };

  updateTestOptions(options: MockPaymentOptions): void {
    this.testOptions = options;
  }

  async initiatePayment(): Promise<void> {
    if (!this.isCheckoutComplete()) {
      this.errorService.addError(
        'CHECKOUT_INCOMPLETE',
        'Please complete all required checkout information'
      );
      return;
    }

    this.loading.set(true);

    try {
      const paymentMethod = this.checkoutState.getSelectedPaymentMethod();
      const sessionId = this.checkoutState.getPaymentSessionId();

      if (!paymentMethod) {
        throw new Error('No payment method selected');
      }

      // Start a new transaction
      this.checkoutState.startNewTransaction();

      if (environment.useRealApi) {
        // Use real payment providers
        await this.processRealPayment(paymentMethod, sessionId);
      } else {
        // Use mock payment for testing
        await this.processMockPayment(paymentMethod);
      }
    } catch (error) {
      console.error('Payment error:', error);

      // Try to recover from error
      if (error && typeof error === 'object' && 'code' in error) {
        const recovered = await this.paymentRecoveryService.attemptRecovery(error as PaymentError);

        if (recovered) {
          this.errorService.addError(
            'PAYMENT_RECOVERED',
            'We\'ve fixed the issue with your payment. Please try again.',
            { severity: 'info' }
          );
        } else {
          this.errorService.addError(
            'PAYMENT_FAILED',
            error instanceof Error ? error.message : 'Payment failed. Please try again with a different method.',
            { severity: 'error' }
          );
        }
      } else {
        this.errorService.addError(
          'PAYMENT_ERROR',
          'An unexpected error occurred. Please try again.',
          { severity: 'error' }
        );
      }
    } finally {
      this.loading.set(false);
    }
  }

  private async processRealPayment(paymentMethod: string, sessionId: string | null): Promise<void> {
    const provider = this.paymentProviderFactory.getProvider(paymentMethod as any);

    if (!provider) {
      throw new Error(`Payment provider for ${paymentMethod} is not available`);
    }

    if (!sessionId) {
      // Create a new session if we don't have one
      const totalAmount = this.cartStore.totalPrice();
      const session = await provider.initializeSession(totalAmount, 'SEK');
      sessionId = session.sessionId;
      this.checkoutState.setPaymentSessionId(sessionId);
    }

    // Process the payment
    const result = await provider.processPayment(sessionId);

    if (result.success) {
      await this.handleSuccessfulPayment(sessionId);
    } else {
      throw {
        code: 'PAYMENT_FAILED',
        message: result.message || 'Payment failed'
      };
    }
  }

  private async processMockPayment(paymentMethod: string): Promise<void> {
    // Generate a mock session ID
    const mockSessionId = `mock_session_${Date.now()}`;
    this.checkoutState.setPaymentSessionId(mockSessionId);

    // Use different mock implementations based on payment method
    if (paymentMethod === 'klarna') {
      const result = await firstValueFrom(
        this.mockPaymentService.mockKlarnaPayment(this.testOptions)
      );

      // Simulate successful payment
      await this.handleSuccessfulPayment(mockSessionId);
    } else if (paymentMethod === 'swish') {
      const result = await firstValueFrom(
        this.mockPaymentService.mockSwishPayment(this.testOptions)
      );

      // For Swish, check the status after a delay
      const reference = result.reference;

      // Wait 4 seconds to simulate user completing payment in Swish app
      await new Promise(resolve => setTimeout(resolve, 4000));

      const status = await firstValueFrom(
        this.mockPaymentService.checkSwishStatus(reference)
      );

      if (status.status === 'PAID') {
        await this.handleSuccessfulPayment(mockSessionId);
      } else {
        throw {
          code: 'PAYMENT_CANCELLED',
          message: 'The payment was cancelled by the user'
        };
      }
    } else {
      // Other payment methods
      // Simulate a 2-second processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (this.testOptions.shouldSucceed !== false) {
        await this.handleSuccessfulPayment(mockSessionId);
      } else {
        throw {
          code: 'PAYMENT_REJECTED',
          message: 'The payment was rejected'
        };
      }
    }
  }

  private async handleSuccessfulPayment(sessionId: string): Promise<void> {
    // Navigate to confirmation page
    await this.router.navigate(['/checkout/confirmation'], {
      queryParams: { sessionId }
    });
  }
}