import { Component, computed, effect, inject, signal } from '@angular/core';
import { PaymentMethod } from '../../../shared/models';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { CheckoutService } from '../../../core/services/checkout.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConstPaymentMethods } from '../../../shared/global/const-payment-methods.enum';

// checkout-payment.component.ts
@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }

    <!-- Payment Method Selection -->
    <div class="space-y-4">
      <div class="grid gap-4">
        @for(method of paymentMethods(); track method) {
          <button class="w-full px-4 py-3 text-left border rounded-md" [class.border-primary]="selectedPaymentMethod() === method" (click)="selectPaymentMethod(method)">
            <div class="flex items-center gap-3">
              <span>{{ method }}</span>
            </div>
          </button>
        }
      </div>
      @if (selectedPaymentMethod() === 'credit_card') {
        <div class="grid gap-4">
          <input type="text" placeholder="Card Number" class="w-full px-4 py-3 border rounded-md" [inputMode]="creditCard.cardNumber" />
          <input type="text" placeholder="Expiry Date" class="w-full px-4 py-3 border rounded-md" [inputMode]="creditCard.expiryDate" />
          <input type="text" placeholder="CVV" class="w-full px-4 py-3 border rounded-md" [inputMode]="creditCard.cvv" />
        </div>
      } @else if (selectedPaymentMethod()) {
        <div class="grid gap-4">
          <div class="w-full px-4 py-3 border rounded-md"></div>
          <div class="w-full px-4 py-3 border rounded-md"></div>
          <div class="w-full px-4 py-3 border rounded-md"></div>
        </div>
      }
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
  private readonly auth = inject(AuthService);
  loading = signal(false);
  paymentMethods = signal<string[]>([ConstPaymentMethods.CREDIT_CARD, ConstPaymentMethods.KLARNA, ConstPaymentMethods.SWISH, ConstPaymentMethods.APPLE_PAY]);
  error = signal<string | null>(null);
  selectedPaymentMethod = signal<string | null>(null);
  creditCard = {
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  };
  sessionId: string | null = null;
  selectPaymentMethod(payment: string) {
    this.checkoutState.setSelectedPaymentMethod(payment);
    this.selectedPaymentMethod.set(payment);
  }

}



// import { Component, computed, effect, inject, signal } from '@angular/core';
// import { PaymentMethod } from '../../../shared/models';
// import { CommonModule } from '@angular/common';
// import { firstValueFrom } from 'rxjs';
// import { CheckoutStateService } from '../../../core/services/checkout-state.service';
// import { CheckoutService } from '../../../core/services/checkout.service';
// import { ErrorService } from '../../../core/services/error.service';

// // checkout-payment.component.ts
// @Component({
//   selector: 'app-checkout-payment',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     @if (loading()) {
//       <div class="flex items-center justify-center h-64">
//         <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     }

//     <!-- Payment Method Selection -->
//     <!-- @if (paymentMethods().length > 0) {
//       <div class="space-y-4">
//         <div class="grid gap-4">
//           @for (method of paymentMethods(); track method.id) {
//             <button
//               class="w-full px-4 py-3 text-left border rounded-md"
//               [class.border-primary]="selectedPaymentMethod() === method.identifier"
//               (click)="selectPaymentMethod(method.identifier)"
//             >
//               <div class="flex items-center gap-3">
//                 <img [src]="method.assetUrls?.descriptive" [alt]="method.name" 
//                      class="w-8 h-8">
//                 <span>{{ method.name }}</span>
//               </div>
//             </button>
//           }
//         </div>

//         <div id="klarna-payments-container" class="bg-background"></div>

//       </div> -->
//     }

//     @if (error()) {
//       <div class="p-4 mt-4 bg-red-50 text-red-700 rounded-lg">
//         {{ error() }}
//       </div>
//     }
//   `
// })
// export class CheckoutPaymentComponent {
//   private readonly checkoutState = inject(CheckoutStateService);
//   private readonly checkoutService = inject(CheckoutService);
//   private readonly errorService = inject(ErrorService);
//   shippingInfo = computed(() => this.checkoutState.getShippingInformation());
//   loading = signal(false);
//   error = signal<string | null>(null);
//   paymentMethods = signal<PaymentMethod[]>([]);
//   selectedPaymentMethod = signal<string | null>(null);
//   sessionId: string | null = null;
//   selectPaymentMethod(payment: PaymentMethod) {
//     this.checkoutState.setPaymentMethod(payment);
//   }
//   // selectPaymentMethod(identifier: string) {
//   //   this.selectedPaymentMethod.set(identifier);
//   //   this.loadPaymentWidget();
//   // }

//   private loadPaymentWidget() {
//     if (!window.Klarna || !this.selectedPaymentMethod()) return;

//     window.Klarna.Payments.load({
//       container: '#klarna-payments-container',
//       payment_method_category: this.selectedPaymentMethod() ?? undefined
//     }, {}, (res) => {
//       if (!res.show_form) {
//         this.error.set('Selected payment method is not available at this time');
//       }
//     });
//   }
//   // async initiatePayment() {
//   //   if (!this.sessionId || !this.selectedPaymentMethod()) return;

//   //   this.loading.set(true);
//   //   this.error.set(null);

//   //   try {
//   //     await new Promise<void>((resolve, reject) => {
//   //       if (!window.Klarna?.Payments) {
//   //         reject(new Error('Klarna is not initialized'));
//   //         return;
//   //       }

//   //       window.Klarna.Payments.authorize({}, {}, async (response) => {
//   //         if (!response.approved) {
//   //           reject(new Error(response.error?.message || 'Payment not approved'));
//   //           return;
//   //         }

//   //         try {
//   //           const result = await firstValueFrom(
//   //             this.checkoutService.authorizePayment({ sessionId: this.sessionId! })
//   //           );

//   //           if (result.success) {
//   //             // Clear checkout state on successful payment
//   //             this.checkoutState.clearCheckoutState();
//   //           } else {
//   //             reject(new Error(result.error?.message ?? 'Authorization failed'));
//   //           }
//   //         } catch (err) {
//   //           reject(new Error(err instanceof Error ? err.message : 'Payment processing failed'));
//   //         }
//   //         resolve();
//   //       });
//   //     });
//   //   } catch (err) {
//   //     this.error.set(err instanceof Error ? err.message : 'Payment failed');
//   //     this.errorService.addError('PAYMENT_ERROR', 'Failed to process payment', {
//   //       severity: 'error',
//   //       context: { error: err }
//   //     });
//   //   } finally {
//   //     this.loading.set(false);
//   //   }
//   // }
//   constructor() {
//       // Subscribe to auth state and shipping info
//       effect(() => {
//         firstValueFrom(this.auth.isAuthenticated$).then(isAuthenticated => {
//           if (isAuthenticated && this.shippingInfo()) {
//             this.initKlarnaCheckout();
//           }
//         });
//       });
//     }

//     editShippingInfo() {
//       this.router.navigate(['/checkout/information']);
//     }

//     private async initKlarnaCheckout() {
//       this.loading.set(true);
//       this.error.set(null);

//       try {
//         const info = this.shippingInfo();
//         if (!info) {
//           throw new Error('Shipping information is required');
//         }

//         const session = await firstValueFrom(
//           this.checkoutService.createKlarnaSession(this.cartItems(), {
//             email: info.email ?? '',
//             phone: info.phone,
//             shippingAddress: {
//               street: info.street,
//               city: info.city,
//               state: info.city, // Using city as state for Sweden
//               country: info.country,
//               postalCode: info.postalCode,
//               id: '',
//               type: 'shipping',
//               firstName: '',
//               lastName: '',
//               isDefault: false
//             }
//           })
//         );

//         this.sessionId = session.session_id;
//         this.paymentMethods.set(session.paymentMethods);

//         if (session.paymentMethods.length > 0) {
//           this.selectPaymentMethod(session.paymentMethods[0].identifier);
//         }
//       }
//       catch (err) {
//         this.error.set(err instanceof Error ? err.message : 'Failed to initialize payment');
//         this.errorService.addError('PAYMENT_INIT_ERROR', 'Failed to initialize payment', {
//           severity: 'error',
//           context: { error: err }
//         });
//       }
//       finally {
//         this.loading.set(false);
//       }
//     }
  
// }
