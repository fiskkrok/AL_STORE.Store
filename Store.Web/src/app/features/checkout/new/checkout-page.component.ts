import { CommonModule } from "@angular/common";
import { Component, inject, computed, signal } from "@angular/core";
import { CheckoutStateService } from "../../../core/services/checkout-state.service";
import { CheckoutInformationComponent } from "./checkout-information.component";
import { CheckoutPaymentComponent } from "./checkout-payment.component";
import { OrderSummaryComponent } from "./order-summary.component";
import { ErrorService } from "../../../core/services/error.service";
import { CheckoutService } from "../../../core/services/checkout.service";
import { firstValueFrom } from "rxjs";
import { CheckoutDeliveryComponent } from "./checkout-delivery.component";

// checkout-page.component.ts
@Component({
    selector: 'app-checkout-page',
    standalone: true,
    imports: [
        CommonModule,
        CheckoutInformationComponent,
        CheckoutPaymentComponent,
        OrderSummaryComponent,
        CheckoutDeliveryComponent
    ],
    template: `
    <div class="container mx-auto px-4 py-8 text-foreground" >
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Main Checkout Flow -->
        <div class="lg:col-span-8 space-y-8">
          <!-- Shipping Section -->
          <section class="bg-background rounded-lg border p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold">1. Shipping Information</h2>
              @if (hasShippingInfo()) {
                <span class="text-green-600">✓ Complete</span>
              }
            </div>
            <app-checkout-information />
          </section>

          <!-- Payment Section -->
          @if (hasShippingInfo()) {
            <section class="bg-background rounded-lg border p-6" 
                     [class.opacity-50]="!hasShippingInfo()">
              <h2 class="text-xl font-semibold mb-4">2. Payment</h2>
              <app-checkout-payment />
            </section>
          }
          
                  <!-- Pick Delivery Options -->
                   @if (hasShippingInfo() && selectedPaymentMethod()) {
                  <section class="bg-background rounded-lg border p-6">
                    <h2 class="text-xl font-semibold mb-4">3. Delivery Options</h2>
                    <!-- Delivery options will go here -->
                     <app-checkout-delivery />
                  </section>
                  }
        </div>


        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-4">
          <div class="sticky top-4">
            <app-order-summary />
          </div>
        </div>
      </div>


      <button
          (click)="initiatePayment()"
          class="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md
                 hover:bg-primary/90 disabled:opacity-50"
          [disabled]="loading() || !selectedPaymentMethod()"
        >
          Complete Purchase
        </button>
    </div>
  `
})
export class CheckoutPageComponent {
    private readonly checkoutState = inject(CheckoutStateService);
    private readonly checkoutService = inject(CheckoutService);
    private readonly errorService = inject(ErrorService);
    error = signal<string | null>(null);
    loading = signal(false);
    hasShippingInfo = computed(() => !!this.checkoutState.getShippingInformation());
    selectedPaymentMethod = computed(() => this.checkoutState.getSelectedPaymentMethod());
    sessionId: string | null = null;
    async initiatePayment() {
        if (!this.sessionId || !this.selectedPaymentMethod()) return;
        this.loading.set(true);
        this.error.set(null);
        try {
            await new Promise<void>((resolve, reject) => {
                if (!window.Klarna?.Payments) {
                    reject(new Error('Klarna is not initialized'));
                    return;
                }
                window.Klarna.Payments.authorize({}, {}, async (response) => {
                    if (!response.approved) {
                        reject(new Error(response.error?.message || 'Payment not approved'));
                        return;
                    }
                    try {
                        const result = await firstValueFrom(
                            this.checkoutService.authorizePayment({ sessionId: this.sessionId! })
                        );
                        if (result.success) {
                            // Clear checkout state on successful payment
                            this.checkoutState.clearCheckoutState();
                        } else {
                            reject(new Error(result.error?.message ?? 'Authorization failed'));
                        }
                    } catch (err) {
                        reject(new Error(err instanceof Error ? err.message : 'Payment processing failed'));
                    }
                    resolve();
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