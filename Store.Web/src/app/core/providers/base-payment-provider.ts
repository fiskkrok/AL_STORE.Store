// src/app/core/providers/base-payment-provider.ts
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { CartItem } from "../state/cart.store";
import { PaymentProvider, PaymentResult, PaymentSession } from "../../shared/models";
import { LoggerService } from "../services/logger.service";

export abstract class BasePaymentProvider implements PaymentProvider {
    protected readonly http = inject(HttpClient);
    protected readonly logger = inject(LoggerService);
    protected readonly apiBaseUrl = environment.apiUrl;

    // Session expiry - 30 minutes by default
    protected readonly SESSION_TTL = 30 * 60 * 1000;

    // Implement required methods from PaymentProvider interface
    abstract initializeSession(amount: number, currency: string): Promise<PaymentSession>;
    abstract processPayment(sessionId: string): Promise<PaymentResult>;

    // Common methods for all payment providers
    protected generateIdempotencyKey(cart: CartItem[]): string {
        const cartString = JSON.stringify(cart.map(item => ({
            id: item.id,
            quantity: item.quantity
        })));
        const timestamp = new Date().getTime();
        return btoa(`${cartString}-${timestamp}`);
    }

    // Format cart items in a standard way for payment providers
    protected formatCartItems(cart: CartItem[]) {
        return cart.map(item => ({
            productId: item.productId,
            productName: item.name,
            sku: item.id,
            quantity: item.quantity,
            unitPrice: item.price
        }));
    }

    // Common error handling
    protected handlePaymentError(error: any): never {
        this.logger.error('Payment provider error', error);
        throw new Error(error instanceof Error ? error.message : 'Payment processing failed');
    }

    // Create default session object
    protected createDefaultSession(sessionId: string, amount: number, currency: string): PaymentSession {
        return {
            sessionId,
            amount,
            currency,
            status: 'pending',
            expiresAt: new Date(Date.now() + this.SESSION_TTL)
        };
    }
}