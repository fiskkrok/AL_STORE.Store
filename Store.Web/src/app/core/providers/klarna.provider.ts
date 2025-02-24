import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { KlarnaSessionResponse, PaymentProvider, PaymentResult, PaymentSession } from "../../shared/models";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";

// providers/klarna.provider.ts
@Injectable({ providedIn: 'root' })
export class KlarnaProvider implements PaymentProvider {
    processPayment(sessionId: string): Promise<PaymentResult> {
        throw new Error("Method not implemented.");
    }
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/api/payments/klarna`;

    async initializeSession(amount: number, currency: string): Promise<PaymentSession> {
        try {
            // Load script first to avoid timing issues
            await this.loadKlarnaScript();

            const response = await firstValueFrom(
                this.http.post<KlarnaSessionResponse>(`${this.apiUrl}/sessions`, {
                    amount,
                    currency,
                    locale: 'sv-SE' // Swedish locale by default
                })
            );

            if (window.Klarna) {
                window.Klarna.Payments.init({ client_token: response.clientToken });
            } else {
                throw new Error('Klarna script failed to load properly');
            }

            return {
                sessionId: response.sessionId,
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

    async process(amount: number, currency: string): Promise<PaymentResult> {
        return new Promise((resolve) => {
            window.Klarna!.Payments.authorize({}, {}, (res) => {
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
                            error: 'Failed to authorize payment'
                        })
                    });
                } else {
                    resolve({
                        success: false,
                        error: res.error?.message || 'Payment not approved'
                    });
                }
            });
        });
    }

    private async createKlarnaSession(config: PaymentConfig): Promise<KlarnaSession> {
        return firstValueFrom(
            this.http.post<KlarnaSession>('/api/payments/klarna/create-session', {
                amount: config.amount,
                currency: config.currency,
                locale: config.locale,
                order_lines: config.items
            })
        );
    }

    private loadKlarnaPaymentOptions(sessionId: string): void {
        // Load Klarna payment widget into the container
        window.Klarna.Payments.load({
            container: '#klarna-payments-container'
        }, {}, (res) => {
            if (!res.show_form) {
                console.error('Failed to load Klarna payment form');
            }
        });
    }

    private async loadKlarnaScript(): Promise<void> {
        if (window.Klarna) return;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://x.klarnacdn.net/kp/lib/v1/api.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject();
            document.head.appendChild(script);
        });
    }
}