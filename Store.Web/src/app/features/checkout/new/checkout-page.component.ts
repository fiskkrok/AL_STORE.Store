import { Component, inject, computed, signal } from "@angular/core";
import { CheckoutStateService } from "../../../core/services/checkout-state.service";
import { CheckoutInformationComponent } from "./checkout-information.component";
import { CheckoutPaymentComponent } from "./checkout-payment.component";
import { OrderSummaryComponent } from "./order-summary.component";
import { CheckoutDeliveryComponent } from "./checkout-delivery.component";


// checkout-page.component.ts
// checkout-page.component.ts
@Component({
  selector: 'app-checkout-page',
  template: `
    <div class="container mx-auto px-4 py-8 text-foreground">
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
            <section class="bg-background rounded-lg border p-6">
              <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold">2. Payment</h2>
              <!-- Should be changed from selectedPaymentMethod() to something like paymentinfoFilledInCorrect -->
               @if (hasShippingInfo() && selectedPaymentMethod()) {
                <span class="text-green-600">✓ Complete</span>
               }
            </div>
              <app-checkout-payment />
            </section>
          }
          
         @if (hasShippingInfo() && selectedPaymentMethod()) {
            <section class="bg-background rounded-lg border p-6">
              <h2 class="text-xl font-semibold mb-4">3. Delivery Options</h2>
              <app-checkout-delivery />
            </section>
          }
          
          <!-- (click)="initiatePayment()" -->
         <button
            class="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            [disabled]="loading() || !selectedPaymentMethod()"
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
  imports: [OrderSummaryComponent, CheckoutDeliveryComponent, CheckoutPaymentComponent, CheckoutInformationComponent]
})
export class CheckoutPageComponent {
  loading = signal(false);
  private readonly checkoutState = inject(CheckoutStateService);

  hasShippingInfo = computed(() => !!this.checkoutState.getShippingInformation());
  selectedPaymentMethod = computed(() => this.checkoutState.getSelectedPaymentMethod());
}
