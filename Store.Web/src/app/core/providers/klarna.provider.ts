import { Injectable, computed, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { CartItem, CheckoutSessionRequest, KlarnaSessionResponse, PaymentProvider, PaymentResult, PaymentSession } from "../../shared/models";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { CheckoutStateService } from "../services/checkout-state.service";
import { CartStore } from "../state";
import { KlarnaScriptService } from "../services/klarna-script.service";

// providers/klarna.provider.ts
@Injectable({ providedIn: 'root' })
export class KlarnaProvider implements PaymentProvider {

    private readonly KLARNA_SESSION_KEY = 'klarnaSession';
    private readonly KLARNA_SESSION_TTL = 30 * 60 * 1000; // 30 minutes
    private readonly http = inject(HttpClient);
    private readonly checkoutState = inject(CheckoutStateService);
    private readonly klarnaScriptService = inject(KlarnaScriptService); // New service
    private readonly cartStore = inject(CartStore);
    private readonly apiUrl = `${environment.apiUrl}/api/payments/klarna`;
    shippingInfo = computed(() => this.checkoutState.getShippingAddress());

    async initializeSession(amount: number, currency: string): Promise<PaymentSession> {
        try {
            // Use the service instead of the component
            await this.klarnaScriptService.loadKlarnaScript();

            let session = this.getKlarnaSession();
            if (!session) {
                const info = this.shippingInfo();
                if (!info) {
                    throw new Error('Shipping information is required');
                }

                session = await firstValueFrom(
                    this.createKlarnaSession(this.cartStore.cartItems(), {
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

            if (window.Klarna) {
                // Initialize Klarna using the service
                this.klarnaScriptService.initializeKlarnaPayments(session.clientToken);
                // Note: We don't load the widget here - that's the component's responsibility
            } else {
                throw new Error('Klarna is not available at this time');
            }

            return {
                sessionId: session.sessionId,
                amount,
                currency,
                status: 'pending',
                expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 min expiry
            };
        } catch (error) {
            console.error('Failed to initialize Klarna session:', error);
            throw new Error('Unable to initialize payment session');
        }
    }
    async processPayment(sessionId: string): Promise<PaymentResult> {

        const response = await firstValueFrom(this.http.post<PaymentResult>(`${this.apiUrl}/sessions/${sessionId}/confirm`, {}));
        return response;
    }

    async process(amount: number, currency: string): Promise<PaymentResult> {
        return new Promise((resolve) => {
            window.Klarna!.Payments.authorize({}, {}, (res: { approved: any; authorization_token: any; error: { code: any; details: any; message: any; }; }) => {
                if (res.approved) {
                    // Send the authorization to your backend
                    this.http.post<PaymentResult>('/api/payments/klarna/authorize', {
                        authorization_token: res.authorization_token,
                        amount,
                        currency
                    }).subscribe({
                        next: (result) => resolve(result),
                        error: () => resolve({
                            success: false,
                            error: { code: res.error?.code, details: res.error?.details },
                            message: res.error?.message || 'Payment not approved'
                        })
                    });
                } else {
                    resolve({
                        success: false,
                        error: {
                            code: res.error?.code,
                            details: res.error?.details
                        },
                        message: res.error?.message || 'Payment not approved'
                    });
                }
            });
        });
    }

    createKlarnaSession(cart: CartItem[], customerInfo: Omit<CheckoutSessionRequest['customer'], 'shippingAddress'> & { shippingAddress: CheckoutSessionRequest['customer']['shippingAddress'] }) {
        const idempotencyKey = this.generateIdempotencyKey(cart);

        const request: CheckoutSessionRequest = {
            items: cart.map(item => ({
                productId: item.productId,
                productName: item.name,
                sku: item.id,
                quantity: item.quantity,
                unitPrice: item.price
            })),
            currency: 'SEK',
            locale: 'sv-SE',
            customer: customerInfo
        };

        return this.http.post<KlarnaSessionResponse>(`${this.apiUrl}/sessions`, request, {
            headers: {
                'Idempotency-Key': idempotencyKey
            }
        });
    }
    private generateIdempotencyKey(cart: CartItem[]): string {
        const cartString = JSON.stringify(cart.map(item => ({
            id: item.id,
            quantity: item.quantity
        })));
        const timestamp = new Date().getTime();
        return btoa(`${cartString}-${timestamp}`);
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
    private saveKlarnaSession(session: KlarnaSessionResponse) {
        const sessionData = {
            session,
            expiry: Date.now() + this.KLARNA_SESSION_TTL
        };
        localStorage.setItem(this.KLARNA_SESSION_KEY, JSON.stringify(sessionData));
    }
}