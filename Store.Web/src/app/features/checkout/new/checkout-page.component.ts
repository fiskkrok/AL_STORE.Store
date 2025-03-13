import { Component, inject, signal, ViewChild } from "@angular/core";
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
import { CommonModule } from "@angular/common";
import { MatStepper, MatStepperModule, } from '@angular/material/stepper';
import { StepperSelectionEvent, STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import { MatIconModule } from "@angular/material/icon";
import { CheckoutService } from "../../../core/services/checkout.service";

// checkout-page.component.ts
@Component({
  selector: 'app-checkout-page',
  standalone: true,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false, showError: true },
    },
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Main Checkout Flow -->
        <div class="lg:col-span-8">
          <mat-vertical-stepper
            #stepper 
            [animationDuration]="'300'"
            [linear]="false"
            class="bg-background rounded-lg border shadow-sm"
            (selectionChange)="onStepChange($event)"
          >
            <!-- Shipping Information Step -->
            <mat-step 
              [completed]="checkoutState.hasShippingInformation()" 
              [editable]="true"
            >
              <ng-template matStepLabel>
                <div class="font-medium">
                  Shipping Information
                </div>
              </ng-template>
              <div class="py-4">
                <app-checkout-information (completed)="nextStep()" />
              </div>
            </mat-step>
            
            <!-- Payment Method Step -->
            <mat-step 
              [completed]="checkoutState.hasPaymentMethod()"
              [editable]="true"
            >
              <ng-template matStepLabel>
                <div class="font-medium">
                  Payment Method
                  @if (!checkoutState.hasShippingInformation() && currentStep() === 1 ) { <span class="text-red-500 text-xs">Please first fill in (Shipping Information)</span> }
                </div>
              </ng-template>
              <div class="py-4">
                <app-checkout-payment (completed)="nextStep()" />
              </div>
            </mat-step>
            
            <!-- Delivery Options Step -->
            <mat-step 
            [completed]="checkoutState.hasDeliveryMethod()" 
            [editable]="true"
            >
            <ng-template matStepLabel>
              <div class="font-medium">
                Delivery Options
                @if (!checkoutState.hasPaymentMethod() && currentStep() === 2 ) { <span class="text-red-500 text-xs">Please first fill in (Payment Method)</span> }
                </div>
              </ng-template>
              <div class="py-4">
                <app-checkout-delivery (completed)="nextStep()" />
              </div>
            </mat-step>
            
            <!-- Review & Pay Step -->
            <mat-step [completed]="false">
              <ng-template matStepLabel>
                  <div class="font-medium">
                    Review & Complete
                  </div>
              </ng-template>
              
              <div class="py-6">
                <h2 class="text-xl font-semibold mb-6">Review Your Order</h2>
                
                <div class="mb-8 space-y-4">
                  @if (checkoutState.hasShippingInformation()) {
                    <div class="rounded-lg bg-muted/30 p-4">
                      <h3 class="text-lg font-medium mb-2">Shipping Address</h3>
                      <div class="text-sm text-muted-foreground">
                        @if (checkoutState.getShippingAddress(); as address) {
                          <p>{{ address.firstName }} {{ address.lastName }}</p>
                          <p>{{ address.street }}</p>
                          <p>{{ address.city }}, {{ address.postalCode }}</p>
                          <p>{{ address.country }}</p>
                        }
                      </div>
                    </div>
                  }
                  
                  @if (checkoutState.hasPaymentMethod()) {
                    <div class="rounded-lg bg-muted/30 p-4">
                      <h3 class="text-lg font-medium mb-2">Payment Method</h3>
                      <p class="text-sm text-muted-foreground capitalize">{{ checkoutState.getSelectedPaymentMethod() }}</p>
                    </div>
                  }
                  
                  @if (checkoutState.hasDeliveryMethod()) {
                    <div class="rounded-lg bg-muted/30 p-4">
                      <h3 class="text-lg font-medium mb-2">Delivery Option</h3>
                      @if (checkoutState.getDeliveryMethod(); as delivery) {
                        <div class="text-sm text-muted-foreground">
                          <p>{{ delivery.name }}</p>
                          <p>{{ delivery.description }}</p>
                          <p>{{ delivery.estimatedDelivery }}</p>
                        </div>
                      }
                    </div>
                  }
                </div>
                
                <button
                  class="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                  [disabled]="loading() || !checkoutState.isCheckoutComplete()"
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
                
                <div class="mt-4 flex justify-between">
                  <button 
                    mat-button 
                    color="primary" 
                    (click)="stepper.previous()"
                  >
                    Back
                  </button>
                </div>
              </div>
            </mat-step>
          
          </mat-vertical-stepper>

          <!-- Testing Controls (only in development) -->
          @if (!environment.production) {
            <div class="mt-4">
              <app-test-payment-controls (optionsChanged)="updateTestOptions($event)" />
            </div>
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
  imports: [
    CommonModule,
    MatStepperModule,
    OrderSummaryComponent,
    CheckoutDeliveryComponent,
    CheckoutPaymentComponent,
    CheckoutInformationComponent,
    TestPaymentControlsComponent,
    MatIconModule
  ],
})
export class CheckoutPageComponent {
  @ViewChild('stepper') stepper!: MatStepper;
  readonly checkoutState = inject(CheckoutService);
  private readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);
  private readonly paymentProviderFactory = inject(PaymentProviderFactory);
  private readonly paymentRecoveryService = inject(PaymentRecoveryService);
  private readonly mockPaymentService = inject(MockPaymentService);
  environment = environment;
  loading = signal(false);
  testOptions: MockPaymentOptions = {
    shouldSucceed: true
  };

  // For stepper control
  nextStep(): void {
    setTimeout(() => {
      this.stepper.next();
    }, 300); // Short delay for better UX
  }
  // Get current stepper index
  currentStep(): number {
    return this.stepper?.selectedIndex;
  }

  onStepChange(event: StepperSelectionEvent): void {
    // This could be used to track step changes if needed
    console.log('Step changed:', event.selectedIndex);
  }

  updateTestOptions(options: MockPaymentOptions): void {
    this.testOptions = options;
  }

  // Simplified error handling to reduce cognitive complexity
  private handlePaymentError(error: any): void {
    console.error('Payment error:', error);

    if (error && typeof error === 'object' && 'code' in error) {
      this.handleStructuredError(error as PaymentError);
    } else {
      this.errorService.addError(
        'PAYMENT_ERROR',
        'An unexpected error occurred. Please try again.',
        { severity: 'error' }
      );
    }
  }

  private async handleStructuredError(error: PaymentError): Promise<void> {
    const recovered = await this.paymentRecoveryService.attemptRecovery(error);

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
  }

  async initiatePayment(): Promise<void> {
    if (!this.checkoutState.isCheckoutComplete()) {
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

      if (environment.useRealApi && !!sessionId) {
        // Use real payment providers
        await this.processRealPayment(paymentMethod, sessionId);
      } else {
        // Use mock payment for testing
        await this.processMockPayment(paymentMethod);
      }
    } catch (error) {
      this.handlePaymentError(error);
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

    // Process the payment - the provider now handles all the specific logic
    const result = await provider.processPayment(sessionId);

    if (result.success) {
      await this.handleSuccessfulPayment(sessionId);
    } else {
      throw new Error(result.message || 'Payment failed');
    }
  }


  private async processMockPayment(paymentMethod: string): Promise<void> {
    // Generate a mock session ID
    const mockSessionId = `mock_session_${Date.now()}`;
    this.checkoutState.setPaymentSessionId(mockSessionId);

    try {
      // Use different mock implementations based on payment method
      if (paymentMethod === 'klarna') {
        await firstValueFrom(
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
          throw new Error('The payment was cancelled by the user');
        }
      } else {
        // Other payment methods
        // Simulate a 2-second processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (this.testOptions.shouldSucceed !== false) {
          await this.handleSuccessfulPayment(mockSessionId);
        } else {
          throw new Error('The payment was rejected');
        }
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  private async handleSuccessfulPayment(sessionId: string): Promise<void> {
    // Navigate to confirmation page
    await this.router.navigate(['/checkout/confirmation'], {
      queryParams: { sessionId }
    });
    // Clear localstorage cart items
    localStorage.removeItem('shopping-cart');

  }
}