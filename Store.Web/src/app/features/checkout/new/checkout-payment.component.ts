import { Component, computed, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstPaymentMethods } from '../../../shared/global/const-payment-methods.enum';
import { CartStore } from '../../../core/state';
import { PaymentSession } from '../../../shared/models';
import { ThemeService } from '../../../core/services/theme.service';
import { CreditCardFormComponent } from './credit-card-form.component';
import { BankPaymentFormComponent } from './bank-payment-form.component';
import { PaymentProviderFactory } from '../../../core/providers/payment-provider.factory';
import { KlarnaScriptService } from '../../../core/services/klarna-script.service';
import { CheckoutService } from '../../../core/services/checkout.service';

@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [CommonModule, CreditCardFormComponent, BankPaymentFormComponent],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }

    <div class="space-y-4">
      <!-- Credit Card -->
      <div class="border rounded-lg overflow-hidden {{!checkoutState.hasShippingInformation() ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}} ">
        <button [disabled]="!checkoutState.hasShippingInformation()"
          class="w-full px-4 py-2 text-left flex items-center justify-between"
          [class.bg-accent]="selectedPaymentMethod() === constPaymentMethods.CREDIT_CARD"
          [class.border-primary]="selectedPaymentMethod() === constPaymentMethods.CREDIT_CARD"
          (click)="selectPaymentMethod(constPaymentMethods.CREDIT_CARD)"
        >
         <div class="flex items-center gap-3"> 
            <div class="border rounded-full w-5 h-5 flex items-center justify-center">
              @if (selectedPaymentMethod() === constPaymentMethods.CREDIT_CARD) {
                <div class="w-3 h-3 bg-primary rounded-full"></div>
              }
            </div>
            <span>Credit Card</span>
          </div>
          <!-- Placeholder for card logos -->
          <div class="flex gap-2">
            <img class="{{currentTheme() === 'light' ? '' : 'hidden'}}" src="assets/websitelogos/credit-card.svg" alt="Visa" class="h-10 w-12">
            <img class="{{currentTheme() === 'light' ? 'hidden' : ''}}" src="assets/websitelogos/credit-card-white.svg" alt="Visa" class="h-10 w-12">
          </div>
        </button>

        @if (selectedPaymentMethod() === constPaymentMethods.CREDIT_CARD) {
          <div class="p-4 border-t">
                <app-credit-card-form></app-credit-card-form>
              </div>
        }
      </div>

      <!-- Klarna -->
      <div class="border rounded-lg overflow-hidden {{!checkoutState.hasShippingInformation() ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}} ">
        <button [disabled]="!checkoutState.hasShippingInformation()"
          class="w-full px-4 text-left flex items-center justify-between"
          [class.bg-accent]="selectedPaymentMethod() === constPaymentMethods.KLARNA"
          [class.border-primary]="selectedPaymentMethod() === constPaymentMethods.KLARNA"
          (click)="selectPaymentMethod(constPaymentMethods.KLARNA)"
        >
          <div class="flex items-center gap-3">
            <div class="border rounded-full w-5 h-5 flex items-center justify-center">
              @if (selectedPaymentMethod() === constPaymentMethods.KLARNA) {
                <div class="w-3 h-3 bg-primary rounded-full"></div>
              }
            </div>
            <span>Klarna</span>
          </div>
          <!-- Placeholder for Klarna logo -->
          <div class="flex  gap-2">
           <img src="assets/svg/klarna-svgrepo-com.svg" alt="KLARNA" class="h-14 w-14">
          </div>
        </button>

        <div class="p-4 border-t {{ selectedPaymentMethod() !== constPaymentMethods.KLARNA ? 'hidden' : '' }}">
          <div id="klarna-payments-container" class="bg-background w-full h-full"></div>
        </div>
      </div>

      <!-- Swish -->
      <div class="border rounded-lg overflow-hidden {{!checkoutState.hasShippingInformation() ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}} ">
        <button [disabled]="!checkoutState.hasShippingInformation()"
          class="w-full px-4 py-3 text-left flex items-center justify-between"
          [class.bg-accent]="selectedPaymentMethod() === constPaymentMethods.SWISH"
          [class.border-primary]="selectedPaymentMethod() === constPaymentMethods.SWISH"
          (click)="selectPaymentMethod(constPaymentMethods.SWISH)"
        >
          <div class="flex items-center gap-3">
            <div class="border rounded-full w-5 h-5 flex items-center justify-center">
              @if (selectedPaymentMethod() === constPaymentMethods.SWISH) {
                <div class="w-3 h-3 bg-primary rounded-full"></div>
              }
            </div>
            <span>Swish</span>
          </div>
          <!-- Placeholder for Swish logo -->
            <div class="flex  gap-2">
             <img src="assets/websitelogos/swish-logo.png" alt="SWISH" class="h-5 w-16">
          </div>
        </button>

        @if (selectedPaymentMethod() === constPaymentMethods.SWISH) {
          <div class="p-4 border-t">
            <!-- Swish payment content -->
              <input type="number" placeholder="PHONENUMBER" class="px-4 py-3 border rounded-md" />
          </div>
        }
      </div>

      <!-- Bank Payment -->
      <div class="border rounded-lg overflow-hidden {{!checkoutState.hasShippingInformation() ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}} ">
        <button [disabled]="!checkoutState.hasShippingInformation()"
          class="w-full px-4 py-3 text-left flex items-center justify-between"
          [class.bg-accent]="selectedPaymentMethod() === constPaymentMethods.BANK_PAYMENT"
          [class.border-primary]="selectedPaymentMethod() === constPaymentMethods.BANK_PAYMENT"
          (click)="selectPaymentMethod(constPaymentMethods.BANK_PAYMENT)"
        >
          <div class="flex items-center gap-3">
            <div class="border rounded-full w-5 h-5 flex items-center justify-center">
              @if (selectedPaymentMethod() === constPaymentMethods.BANK_PAYMENT) {
                <div class="w-3 h-3 bg-primary rounded-full"></div>
              }
            </div>
            <span>Bank Payment</span>
          </div>
          <!-- Placeholder for Bank logos -->
          <div class="flex  gap-2">
            <img src="assets/websitelogos/credit-card.svg" alt="BANK" class="h-5 w-16">
          </div>
        </button>

        @if (selectedPaymentMethod() === constPaymentMethods.BANK_PAYMENT) {
          <div class="p-4 border-t">
            <app-bank-payment-form></app-bank-payment-form>
          </div>
        }
      </div>

    </div>

    @if (error()) {
      <div class="p-4 mt-4 bg-red-50 text-red-700 rounded-lg">
        {{ error() }}
      </div>
    }
  `
})
export class CheckoutPaymentComponent {
  @Output() completed = new EventEmitter<void>();

  readonly checkoutState = inject(CheckoutService);
  private readonly theme = inject(ThemeService);
  private readonly cartStore = inject(CartStore);
  private readonly klarnaScriptService = inject(KlarnaScriptService);
  private readonly paymentProviderFactory = inject(PaymentProviderFactory);
  currentTheme = computed(() => {
    const theme = this.theme.currentTheme();
    return theme;
  })
  cartItems = this.cartStore.cartItems;
  loading = signal(false);
  constPaymentMethods = ConstPaymentMethods;
  error = signal<string | null>(null);
  paymentSession = signal<PaymentSession>({} as PaymentSession);
  selectedPaymentMethod = signal<string | null>(null);
  creditCard = {
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  };

  async selectPaymentMethod(method: string) {
    // Clear previous state
    this.error.set(null);

    // Update selection
    this.selectedPaymentMethod.set(method);
    this.checkoutState.setSelectedPaymentMethod(method);

    // Initialize the selected payment method
    if (method === 'klarna' || method === 'swish') {
      await this.initializePaymentMethod(method);
    } else {
      // For payment methods that don't need async initialization, emit completion immediately
      this.completed.emit();
    }
  }

  private async initializePaymentMethod(method: string) {
    this.loading.set(true);

    try {
      const provider = this.paymentProviderFactory.getProvider(method);

      if (!provider) {
        throw new Error(`Provider for ${method} not available`);
      }

      // Get total amount from cart
      const amount = this.cartStore.totalPrice();

      // Initialize payment session
      const session = await provider.initializeSession(amount, 'SEK');

      // Save to state
      this.paymentSession.set(session);
      this.checkoutState.setPaymentSessionId(session.sessionId);
      if (method === 'klarna') {
        // Load the payment widget in the component after session is initialized
        this.klarnaScriptService.loadPaymentWidget('#klarna-payments-container',
          (errorMessage) => this.error.set(errorMessage));
        // Method-specific handling
      }
      else if (method === 'swish') {
        // Fetch QR code or do other Swish-specific setup
        // (This depends on your Swish implementation)
      }

      // Emit completion event after the payment method is fully initialized
      this.completed.emit();
    } catch (error) {
      console.error(`Failed to initialize ${method}:`, error);
      this.error.set(`Could not set up ${method} payment. Please try again.`);
    } finally {
      this.loading.set(false);
    }
  }

}