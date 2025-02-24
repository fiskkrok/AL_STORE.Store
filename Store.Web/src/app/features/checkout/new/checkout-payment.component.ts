import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConstPaymentMethods } from '../../../shared/global/const-payment-methods.enum';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { CheckoutService } from '../../../core/services/checkout.service';
import { CartStore } from '../../../core/state';
import { ErrorService } from '../../../core/services/error.service';
import { KlarnaSessionResponse, PaymentMethod, PaymentSession } from '../../../shared/models';
import { ThemeService } from '../../../core/services/theme.service';
import { CreditCardFormComponent } from './credit-card-form.component';
import { BankPaymentFormComponent } from './bank-payment-form.component';
import { BankPaymentService } from '../../../core/services/bank-payment.service';
import { PaymentProviderFactory } from '../../../core/providers/payment-provider.factory';

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
      <div class="border rounded-lg overflow-hidden hover:border-primary">
        <button 
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
      <div class="border rounded-lg overflow-hidden hover:border-primary">
        <button 
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
      <div class="border rounded-lg overflow-hidden hover:border-primary">
        <button 
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
      <div class="border rounded-lg overflow-hidden hover:border-primary">
        <button 
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
            <img src="assets/websitelogos/bank-logo.png" alt="BANK" class="h-5 w-16">
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
  private readonly checkoutState = inject(CheckoutStateService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly errorService = inject(ErrorService);
  private readonly theme = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly cartStore = inject(CartStore);
  private readonly bankPaymentService = inject(BankPaymentService);
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
  shippingInfo = computed(() => this.checkoutState.getShippingInformation());
  creditCard = {
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  };
  sessionId: string | null = null;
  sessionData = signal<KlarnaSessionResponse | undefined>(undefined);
  private readonly KLARNA_SESSION_KEY = 'klarnaSession';
  private readonly KLARNA_SESSION_TTL = 30 * 60 * 1000; // 30 minutes

  private saveKlarnaSession(session: KlarnaSessionResponse) {
    const sessionData = {
      session,
      expiry: Date.now() + this.KLARNA_SESSION_TTL
    };
    localStorage.setItem(this.KLARNA_SESSION_KEY, JSON.stringify(sessionData));
  }

  private getKlarnaSession(): KlarnaSessionResponse | null {
    const sessionData = localStorage.getItem(this.KLARNA_SESSION_KEY);
    if (!sessionData) return null;

    const { session, expiry } = JSON.parse(sessionData);
    if (Date.now() > expiry) {
      localStorage.removeItem(this.KLARNA_SESSION_KEY);
      return null;
    }
    return session;
  }

  async selectPaymentMethod(method: string) {
    // Clear previous state
    this.error.set(null);

    // Update selection
    this.selectedPaymentMethod.set(method);
    this.checkoutState.setSelectedPaymentMethod(method);

    // Initialize the selected payment method
    if (method === 'klarna' || method === 'swish') {
      await this.initializePaymentMethod(method);
    }
  }

  private async initializePaymentMethod(method: string) {
    this.loading.set(true);

    try {
      const provider = this.paymentProviderFactory.getProvider(method as PaymentMethod);

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

      // Method-specific handling
      if (method === 'swish') {
        // Fetch QR code or do other Swish-specific setup
        // (This depends on your Swish implementation)
      }
    } catch (error) {
      console.error(`Failed to initialize ${method}:`, error);
      this.error.set(`Could not set up ${method} payment. Please try again.`);
    } finally {
      this.loading.set(false);
    }
  }
  constructor() {
    // Subscribe to auth state and shipping info
    effect(() => {
      firstValueFrom(this.auth.isAuthenticated$).then(isAuthenticated => {
        if (isAuthenticated && this.shippingInfo()) {
          this.initKlarnaCheckout();
        }
      });
    });
  }

  private async initKlarnaCheckout() {
    this.loading.set(true);
    this.error.set(null);

    try {
      let session = this.getKlarnaSession();
      if (!session) {
        const info = this.shippingInfo();
        if (!info) {
          throw new Error('Shipping information is required');
        }

        session = await firstValueFrom(
          this.checkoutService.createKlarnaSession(this.cartItems(), {
            email: info.email ?? '',
            phone: info.phone,
            shippingAddress: {
              street: info.street,
              city: info.city,
              state: info.city, // Using city as state for Sweden
              country: info.country,
              postalCode: info.postalCode,
              id: '',
              type: 'shipping',
              firstName: '',
              lastName: '',
              isDefault: false
            }
          })
        );
        this.saveKlarnaSession(session);
      }
      this.sessionData.set(session);
      this.sessionId = session.sessionId;

      await this.loadKlarnaScript();
      if (window.Klarna) {
        window.Klarna.Payments.init({ client_token: session.clientToken });
        this.loadPaymentWidget();
      } else {
        this.error.set('Klarna is not available at this time');
      }
    } catch (err) {
      this.error.set('Failed to initialize checkout. Please try again.');
      this.errorService.addError('CHECKOUT_ERROR', 'Failed to initialize checkout', {
        severity: 'error',
        context: { error: err }
      });
    } finally {
      this.loading.set(false);
    }
  }

  private loadPaymentWidget() {
    if (!window.Klarna) return;

    window.Klarna.Payments.load({
      container: '#klarna-payments-container',
      payment_method_category: 'pay_later'
    }, {}, (res) => {
      if (!res.show_form) {
        this.error.set('Selected payment method is not available at this time');
      }
    });
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
      script.onerror = () => reject(new Error('Failed to load Klarna script'));
      document.body.appendChild(script);
    });
  }

  private async initBankPayment() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const session = await firstValueFrom(this.bankPaymentService.createBankPaymentSession(this.cartItems()));
      this.sessionData.set(session as unknown as KlarnaSessionResponse);
      this.sessionId = (session as unknown as KlarnaSessionResponse).sessionId;

      // Load bank payment widget or redirect to bank payment page
    } catch (err) {
      this.error.set('Failed to initialize bank payment. Please try again.');
      this.errorService.addError('BANK_PAYMENT_ERROR', 'Failed to initialize bank payment', {
        severity: 'error',
        context: { error: err }
      });
    } finally {
      this.loading.set(false);
    }
  }
}