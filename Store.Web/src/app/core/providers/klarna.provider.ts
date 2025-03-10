// src/app/core/providers/klarna.provider.ts
import { Injectable, computed, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { CheckoutSessionRequest, KlarnaSessionResponse, PaymentResult, PaymentSession } from "../../shared/models";
import { CheckoutService } from "../services/checkout.service";
import { CartItem, CartStore } from "../state";
import { BasePaymentProvider } from "./base-payment-provider";
import { KlarnaScriptService } from "../services/klarna-script.service";

@Injectable({ providedIn: 'root' })
export class KlarnaProvider extends BasePaymentProvider {
    private readonly KLARNA_SESSION_KEY = 'klarnaSession';
    private readonly checkoutService = inject(CheckoutService);
    private readonly klarnaScriptService = inject(KlarnaScriptService);
    private readonly cartStore = inject(CartStore);

    shippingInfo = computed(() => this.checkoutService.getShippingAddress());

    async initializeSession(amount: number, currency: string): Promise<PaymentSession> {
        try {
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
                            state: info.city,
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
                this.klarnaScriptService.initializeKlarnaPayments(session.clientToken);
            } else {
                throw new Error('Klarna is not available at this time');
            }

            return this.createDefaultSession(session.sessionId, amount, currency);
        } catch (error) {
            this.logger.error('Failed to initialize Klarna session:', error);
            return this.handlePaymentError(error);
        }
    }

    async processPayment(sessionId: string): Promise<PaymentResult> {
        const apiUrl = `${this.apiBaseUrl}/api/payments/klarna`;
        return firstValueFrom(this.http.post<PaymentResult>(
            `${apiUrl}/sessions/${sessionId}/confirm`, {}
        ));
    }

    createKlarnaSession(cart: CartItem[], customerInfo: any) {
        const idempotencyKey = this.generateIdempotencyKey(cart);
        const apiUrl = `${this.apiBaseUrl}/api/payments/klarna`;

        const request: CheckoutSessionRequest = {
            items: this.formatCartItems(cart),
            currency: 'SEK',
            locale: 'sv-SE',
            customer: customerInfo
        };

        return this.http.post<KlarnaSessionResponse>(`${apiUrl}/sessions`, request, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
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
            expiry: Date.now() + this.SESSION_TTL
        };
        localStorage.setItem(this.KLARNA_SESSION_KEY, JSON.stringify(sessionData));
    }
}