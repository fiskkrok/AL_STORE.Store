// src/app/core/providers/klarna.provider.ts
import { Injectable, computed, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { CheckoutSessionRequest, KlarnaSessionResponse, PaymentResult, PaymentSession } from "../../shared/models";
import { CheckoutService } from "../services/checkout.service";
import { CartItem, CartStore } from "../state";
import { BasePaymentProvider } from "./base-payment-provider";
import { KlarnaScriptService } from "../services/klarna-script.service";
import { HttpHeaders } from "@angular/common/http";

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

    async processPayment(sessionId: string): Promise<PaymentResult> {
        try {
            // Step 1: Authorize with Klarna client-side SDK
            const authResult = await this.klarnaScriptService.authorizeKlarnaPayment();

            if (!authResult.success) {
                throw new Error(authResult.error || 'Failed to authorize Klarna payment');
            }

            console.log('Calling authorize endpoint...');

            // Use firstValueFrom with proper request body
            const authorizeResponse = await firstValueFrom(
                this.http.post<AuthorizePaymentResponse>(
                    `${this.apiBaseUrl}/api/payments/klarna/authorize`,
                    {
                        authorizationToken: authResult.token,
                        sessionId: sessionId,

                    },
                    {
                        headers: new HttpHeaders({
                            'Idempotency-Key': this.generateIdempotencyKeyV2()
                        })
                    }
                )
            );
            console.log('Received response:', authorizeResponse);

            if (!authorizeResponse) {
                throw new Error('Received null response from authorization endpoint');
            }

            // Return success result
            return {
                success: true,
                message: 'Payment authorized successfully',
                transactionId: authorizeResponse.paymentId || sessionId
            };
        } catch (error) {
            console.error('Full error details:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Payment processing failed',
                error: {
                    code: 'PAYMENT_FAILED',
                    details: error
                }
            };
        }
    }

    private generateIdempotencyKeyV2(): string {
        return `klarna_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}

// Define interface to match your backend response
interface AuthorizePaymentResponse {
    paymentId: string;
    status: string;
}