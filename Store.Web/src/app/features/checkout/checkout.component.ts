// // src/app/features/checkout/checkout.component.ts
// import { Component, computed, effect, inject, signal } from '@angular/core';
// import { CartStore } from '../../core/state/cart.store';
// import { CheckoutService } from '../../core/services/checkout.service';
// import { ErrorService } from '../../core/services/error.service';
// import { klarnaHelpers } from '../../core/config/klarna.config';
// import { firstValueFrom } from 'rxjs';
// import { Router } from '@angular/router';
// import { CheckoutStateService } from '../../core/services/checkout-state.service';
// import { AuthService } from '../../core/services/auth.service';
// import { PaymentMethod } from '../../shared/models';
// import { CheckoutSummaryComponent } from "./checkout-summary.component";
// import { CheckoutPaymentComponent } from "./new/checkout-payment.component";
// import { CheckoutInformationComponent } from "./new/checkout-information.component";

// @Component({
//   selector: 'app-checkout',
//   standalone: true,
//   imports: [CheckoutSummaryComponent, CheckoutPaymentComponent, CheckoutInformationComponent],
//   template: `
//     <!-- <div class="container mx-auto px-4 py-8 text-foreground">
//       <div class="grid grid-cols-1 lg:grid-cols-2 gap-8"> -->
       
//         <!-- Shipping Information Summary -->
//         <!-- @if (shippingInfo()) {
//           <div class="mb-6 p-4 border rounded-md">
//             <h3 class="font-medium mb-2">Shipping Address</h3>
//             <p>{{ shippingInfo()?.firstName }} {{ shippingInfo()?.lastName }}</p>
//             <p>{{ shippingInfo()?.street }}</p>
//             <p>{{ shippingInfo()?.city }}, {{ shippingInfo()?.postalCode }}</p>
//             <button 
//               (click)="editShippingInfo()"
//               class="text-sm text-primary mt-2 hover:underline"
//             >
//               Edit
//             </button>
//           </div>
//         } -->
// <div class="container mx-auto px-4 py-8">
//       <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
//         <!-- Main Checkout Flow (8 columns) -->
//         <div class="lg:col-span-8 space-y-8">
//           <!-- Shipping Section -->
//           <section class="bg-background rounded-lg border p-6">
//             <h2 class="text-xl font-semibold mb-4">1. Shipping Information</h2>
//             <app-checkout-information />
//           </section>
//          <!-- Payment Section -->
//           <section class="bg-background rounded-lg border p-6">
//             <h2 class="text-xl font-semibold mb-4">2. Payment</h2>
//             <app-checkout-payment />
//           </section>
//         </div>
//          <!-- Order Summary -->
//         <div class="lg:col-span-4">
//           <div class="sticky top-4">
//             <app-checkout-summary [cartItems]="cartItems()" [tax]="tax()" [total]="total()" [subtotal]="subtotal()"/>
//           </div>
//         </div>
//       </div>
//     </div>
//   `
// })
// export class CheckoutComponent {
//   private readonly cartStore = inject(CartStore);
//   private readonly checkoutService = inject(CheckoutService);
//   private readonly errorService = inject(ErrorService);
//   private readonly router = inject(Router);
//   private readonly checkoutState = inject(CheckoutStateService);
//   private readonly auth = inject(AuthService);

//   cartItems = this.cartStore.cartItems;
//   subtotal = this.cartStore.totalPrice;
//   tax = computed(() => klarnaHelpers.calculateTax(this.subtotal()));
//   total = computed(() => this.subtotal() + this.tax());
//   shippingInfo = computed(() => this.checkoutState.getShippingInformation());

//   loading = signal(false);
//   error = signal<string | null>(null);
//   paymentMethods = signal<PaymentMethod[]>([]);
//   selectedPaymentMethod = signal<string | null>(null);
//   sessionId: string | null = null;

//   constructor() {
//     // Subscribe to auth state and shipping info
//     effect(() => {
//       firstValueFrom(this.auth.isAuthenticated$).then(isAuthenticated => {
//         if (isAuthenticated && this.shippingInfo()) {
//           this.initKlarnaCheckout();
//         }
//       });
//     });
//   }

//   editShippingInfo() {
//     this.router.navigate(['/checkout/information']);
//   }

//   private async initKlarnaCheckout() {
//     this.loading.set(true);
//     this.error.set(null);

//     try {
//       const info = this.shippingInfo();
//       if (!info) {
//         throw new Error('Shipping information is required');
//       }

//       const session = await firstValueFrom(
//         this.checkoutService.createKlarnaSession(this.cartItems(), {
//           email: info.email ?? '',
//           phone: info.phone,
//           shippingAddress: {
//             street: info.street,
//             city: info.city,
//             state: info.city, // Using city as state for Sweden
//             country: info.country,
//             postalCode: info.postalCode,
//             id: '',
//             type: 'shipping',
//             firstName: '',
//             lastName: '',
//             isDefault: false
//           }
//         })
//       );

//       this.sessionId = session.session_id;
//       this.paymentMethods.set(session.paymentMethods);

//       if (session.paymentMethods.length > 0) {
//         this.selectPaymentMethod(session.paymentMethods[0].identifier);
//       }


//       await this.loadKlarnaScript();
//       if (window.Klarna) {
//         window.Klarna.Payments.init({ client_token: session.client_token });
//         this.loadPaymentWidget();
//       } else {
//         this.error.set('Klarna is not available at this time');
//       }
//     } catch (err) {
//       this.error.set('Failed to initialize checkout. Please try again.');
//       this.errorService.addError('CHECKOUT_ERROR', 'Failed to initialize checkout', {
//         severity: 'error',
//         context: { error: err }
//       });
//     } finally {
//       this.loading.set(false);
//     }
//   }

//   selectPaymentMethod(identifier: string) {
//     this.selectedPaymentMethod.set(identifier);
//     this.loadPaymentWidget();
//   }

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

//   private loadKlarnaScript(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       if (window.Klarna) {
//         resolve();
//         return;
//       }
//       const script = document.createElement('script');
//       script.src = 'https://x.klarnacdn.net/kp/lib/v1/api.js';
//       script.async = true;
//       script.onload = () => resolve();
//       script.onerror = () => reject(new Error('Failed to load Klarna script'));
//       document.body.appendChild(script);
//     });
//   }

//   async initiatePayment() {
//     if (!this.sessionId || !this.selectedPaymentMethod()) return;

//     this.loading.set(true);
//     this.error.set(null);

//     try {
//       await new Promise<void>((resolve, reject) => {
//         if (!window.Klarna?.Payments) {
//           reject(new Error('Klarna is not initialized'));
//           return;
//         }

//         window.Klarna.Payments.authorize({}, {}, async (response) => {
//           if (!response.approved) {
//             reject(new Error(response.error?.message || 'Payment not approved'));
//             return;
//           }

//           try {
//             const result = await firstValueFrom(
//               this.checkoutService.authorizePayment({ sessionId: this.sessionId! })
//             );

//             if (result.success) {
//               // Clear checkout state on successful payment
//               this.checkoutState.clearCheckoutState();

//               this.router.navigate(['/checkout/confirmation'], {
//                 queryParams: { orderId: result.orderId }
//               });
//             } else {
//               reject(new Error(result.error?.message ?? 'Authorization failed'));
//             }
//           } catch (err) {
//             reject(new Error(err instanceof Error ? err.message : 'Payment processing failed'));
//           }
//           resolve();
//         });
//       });
//     } catch (err) {
//       this.error.set(err instanceof Error ? err.message : 'Payment failed');
//       this.errorService.addError('PAYMENT_ERROR', 'Failed to process payment', {
//         severity: 'error',
//         context: { error: err }
//       });
//     } finally {
//       this.loading.set(false);
//     }
//   }
// }



//V1 
// src/app/features/checkout/checkout.component.ts
// import { Component, computed, effect, inject, signal } from '@angular/core';
// import { CartStore } from '../../core/state/cart.store';
// import { CheckoutService } from '../../core/services/checkout.service';
// import { ErrorService } from '../../core/services/error.service';
// import { klarnaHelpers } from '../../core/config/klarna.config';
// import { firstValueFrom } from 'rxjs';
// import { CurrencyPipe } from '@angular/common';
// import { Router } from '@angular/router';
// import { CheckoutStateService } from '../../core/services/checkout-state.service';
// import { AuthService } from '../../core/services/auth.service';
// import { PaymentMethod } from '../../shared/models';

// @Component({
//   selector: 'app-checkout',
//   standalone: true,
//   imports: [CurrencyPipe],
//   template: `
//     <div class="container mx-auto px-4 py-8 text-foreground">
//       <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <!-- Order Summary -->
//         <div class="space-y-4">
//           <h2 class="text-2xl font-bold">Order Summary</h2>
          
//           @for (item of cartItems(); track item.id) {
//             <div class="flex items-center gap-4 border-b py-4">
//               <img [src]="item.imageUrl" [alt]="item.name" 
//                    class="w-20 h-20 object-cover rounded">
//               <div class="flex-1">
//                 <h3 class="font-medium">{{ item.name }}</h3>
//                 <p class="text-sm text-muted-foreground">
//                   Quantity: {{ item.quantity }}
//                 </p>
//                 <p class="font-medium">
//                   {{ item.price * item.quantity | currency:'SEK' }}
//                 </p>
//               </div>
//             </div>
//           }

//           <div class="border-t pt-4 space-y-2">
//             <div class="flex justify-between">
//               <span>Subtotal</span>
//               <span>{{ subtotal() | currency:'SEK' }}</span>
//             </div>
//             <div class="flex justify-between">
//               <span>VAT (25%)</span>
//               <span>{{ tax() | currency:'SEK' }}</span>
//             </div>
//             <div class="flex justify-between font-bold">
//               <span>Total</span>
//               <span>{{ total() | currency:'SEK' }}</span>
//             </div>
//           </div>
//         </div>

//         <!-- Shipping Information Summary -->
//         @if (shippingInfo()) {
//           <div class="mb-6 p-4 border rounded-md">
//             <h3 class="font-medium mb-2">Shipping Address</h3>
//             <p>{{ shippingInfo()?.firstName }} {{ shippingInfo()?.lastName }}</p>
//             <p>{{ shippingInfo()?.street }}</p>
//             <p>{{ shippingInfo()?.city }}, {{ shippingInfo()?.postalCode }}</p>
//             <button 
//               (click)="editShippingInfo()"
//               class="text-sm text-primary mt-2 hover:underline"
//             >
//               Edit
//             </button>
//           </div>
//         }

//         <!-- Klarna Payment -->
//         <div>
//           @if (loading()) {
//             <div class="flex items-center justify-center h-64">
//               <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//             </div>
//           }

//           <!-- Payment Method Selection -->
//           @if (!!paymentMethods()&&paymentMethods().length > 0) {
//             <div class="mb-4 space-y-2">
//               <h3 class="font-medium">Select Payment Method</h3>
//               @for (method of paymentMethods(); track method.id) {
//                 <button
//                   class="w-full px-4 py-2 text-left border rounded-md active:bg-primary/10" 
//                   type="button"
//                   [class.border-primary]="selectedPaymentMethod() === method.identifier"
//                   (click)="selectPaymentMethod(method.identifier)"
//                 >
//                 <img [src]="method?.assetUrls?.descriptive" [alt]="method.name" class="w-8 h-8">
//                 {{ method.name }}
//               </button>
//               }
//             </div>
//           }

//           <div id="klarna-payments-container" class="bg-background"></div>

//           @if (!!paymentMethods()&&paymentMethods().length > 0)  {
//             <button
//               (click)="initiatePayment()"
//               class="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
//               [disabled]="loading() || !selectedPaymentMethod()"
//             >
//               @if (loading()) {
//                 <span class="flex items-center justify-center">
//                   <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
//                     <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
//                   </svg>
//                   Processing Payment...
//                 </span>
//               } @else {
//                 Complete Purchase
//               }
//             </button>
//           }

//           @if (error()) {
//             <div class="p-4 mt-4 bg-red-50 text-red-700 rounded-lg">
//               {{ error() }}
//             </div>
//           }
//         </div>
//       </div>
//     </div>
//   `
// })
// export class CheckoutComponent {
//   private readonly cartStore = inject(CartStore);
//   private readonly checkoutService = inject(CheckoutService);
//   private readonly errorService = inject(ErrorService);
//   private readonly router = inject(Router);
//   private readonly checkoutState = inject(CheckoutStateService);
//   private readonly auth = inject(AuthService);

//   cartItems = this.cartStore.cartItems;
//   subtotal = this.cartStore.totalPrice;
//   tax = computed(() => klarnaHelpers.calculateTax(this.subtotal()));
//   total = computed(() => this.subtotal() + this.tax());
//   shippingInfo = computed(() => this.checkoutState.getShippingInformation());

//   loading = signal(false);
//   error = signal<string | null>(null);
//   paymentMethods = signal<PaymentMethod[]>([]);
//   selectedPaymentMethod = signal<string | null>(null);
//   sessionId: string | null = null;

//   constructor() {
//     // Subscribe to auth state and shipping info
//     effect(() => {
//       firstValueFrom(this.auth.isAuthenticated$).then(isAuthenticated => {
//         if (isAuthenticated && this.shippingInfo()) {
//           this.initKlarnaCheckout();
//         }
//       });
//     });
//   }

//   editShippingInfo() {
//     this.router.navigate(['/checkout/information']);
//   }

//   private async initKlarnaCheckout() {
//     this.loading.set(true);
//     this.error.set(null);

//     try {
//       const info = this.shippingInfo();
//       if (!info) {
//         throw new Error('Shipping information is required');
//       }

//       const session = await firstValueFrom(
//         this.checkoutService.createKlarnaSession(this.cartItems(), {
//           email: info.email ?? '',
//           phone: info.phone,
//           shippingAddress: {
//             street: info.street,
//             city: info.city,
//             state: info.city, // Using city as state for Sweden
//             country: info.country,
//             postalCode: info.postalCode,
//             id: '',
//             type: 'shipping',
//             firstName: '',
//             lastName: '',
//             isDefault: false
//           }
//         })
//       );

//       this.sessionId = session.session_id;
//       this.paymentMethods.set(session.paymentMethods);

//       if (session.paymentMethods.length > 0) {
//         this.selectPaymentMethod(session.paymentMethods[0].identifier);
//       }


//       await this.loadKlarnaScript();
//       if (window.Klarna) {
//         window.Klarna.Payments.init({ client_token: session.client_token });
//         this.loadPaymentWidget();
//       } else {
//         this.error.set('Klarna is not available at this time');
//       }
//     } catch (err) {
//       this.error.set('Failed to initialize checkout. Please try again.');
//       this.errorService.addError('CHECKOUT_ERROR', 'Failed to initialize checkout', {
//         severity: 'error',
//         context: { error: err }
//       });
//     } finally {
//       this.loading.set(false);
//     }
//   }

//   selectPaymentMethod(identifier: string) {
//     this.selectedPaymentMethod.set(identifier);
//     this.loadPaymentWidget();
//   }

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

//   private loadKlarnaScript(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       if (window.Klarna) {
//         resolve();
//         return;
//       }
//       const script = document.createElement('script');
//       script.src = 'https://x.klarnacdn.net/kp/lib/v1/api.js';
//       script.async = true;
//       script.onload = () => resolve();
//       script.onerror = () => reject(new Error('Failed to load Klarna script'));
//       document.body.appendChild(script);
//     });
//   }

//   async initiatePayment() {
//     if (!this.sessionId || !this.selectedPaymentMethod()) return;

//     this.loading.set(true);
//     this.error.set(null);

//     try {
//       await new Promise<void>((resolve, reject) => {
//         if (!window.Klarna?.Payments) {
//           reject(new Error('Klarna is not initialized'));
//           return;
//         }

//         window.Klarna.Payments.authorize({}, {}, async (response) => {
//           if (!response.approved) {
//             reject(new Error(response.error?.message || 'Payment not approved'));
//             return;
//           }

//           try {
//             const result = await firstValueFrom(
//               this.checkoutService.authorizePayment({ sessionId: this.sessionId! })
//             );

//             if (result.success) {
//               // Clear checkout state on successful payment
//               this.checkoutState.clearCheckoutState();

//               this.router.navigate(['/checkout/confirmation'], {
//                 queryParams: { orderId: result.orderId }
//               });
//             } else {
//               reject(new Error(result.error?.message ?? 'Authorization failed'));
//             }
//           } catch (err) {
//             reject(new Error(err instanceof Error ? err.message : 'Payment processing failed'));
//           }
//           resolve();
//         });
//       });
//     } catch (err) {
//       this.error.set(err instanceof Error ? err.message : 'Payment failed');
//       this.errorService.addError('PAYMENT_ERROR', 'Failed to process payment', {
//         severity: 'error',
//         context: { error: err }
//       });
//     } finally {
//       this.loading.set(false);
//     }
//   }
// }