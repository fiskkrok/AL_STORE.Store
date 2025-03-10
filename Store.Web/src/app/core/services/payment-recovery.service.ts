// src/app/core/services/payment-recovery.service.ts
import { Injectable, inject } from '@angular/core';
import { PaymentProviderFactory } from '../providers/payment-provider.factory';
import { CartStore } from '../state/cart.store';
import { Router } from '@angular/router';
import { ErrorService } from './error.service';
import { CheckoutService } from './checkout.service';

export interface PaymentError {
    code: string;
    message: string;
    originalError?: any;
}

@Injectable({ providedIn: 'root' })
export class PaymentRecoveryService {
    private readonly checkoutState = inject(CheckoutService);
    private readonly paymentProviderFactory = inject(PaymentProviderFactory);
    private readonly cartStore = inject(CartStore);
    private readonly router = inject(Router);
    private readonly errorService = inject(ErrorService);

    private retryCount = 0;
    private readonly MAX_RETRIES = 3;

    async attemptRecovery(error: PaymentError): Promise<boolean> {
        if (this.retryCount >= this.MAX_RETRIES) {
            this.errorService.addError(
                'PAYMENT_RECOVERY_FAILED',
                'We\'ve tried several times but couldn\'t complete your payment. Please try again with a different payment method.',
                { severity: 'error' }
            );
            return false;
        }

        this.retryCount++;

        const paymentMethod = this.checkoutState.getSelectedPaymentMethod();
        if (!paymentMethod) return false;

        try {
            switch (error.code) {
                case 'SESSION_EXPIRED':
                    return await this.refreshPaymentSession(paymentMethod);

                case 'NETWORK_ERROR':
                    return await this.retryLastOperation(paymentMethod);

                case 'PAYMENT_CANCELED':
                    return await this.handleCancelledPayment(paymentMethod);

                case 'PAYMENT_REJECTED':
                    // Cannot recover from rejection - suggest another payment method
                    this.errorService.addError(
                        'PAYMENT_REJECTED',
                        'Your payment was declined. Please try a different payment method.',
                        { severity: 'warning' }
                    );
                    return false;

                default:
                    // Unhandled error - log and suggest user try again
                    console.error('Unhandled payment error:', error);
                    return false;
            }
        } catch (recoveryError) {
            console.error('Error during payment recovery:', recoveryError);
            return false;
        }
    }

    private async refreshPaymentSession(paymentMethod: string): Promise<boolean> {
        const provider = this.paymentProviderFactory.getProvider(paymentMethod as any);
        if (!provider) return false;

        try {
            // Create a new payment session
            const totalAmount = this.cartStore.totalPrice();
            const session = await provider.initializeSession(totalAmount, 'SEK');

            if (session) {
                this.checkoutState.setPaymentSessionId(session.sessionId);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    private async retryLastOperation(paymentMethod: string): Promise<boolean> {
        // Add a small delay before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));

        const sessionId = this.checkoutState.getPaymentSessionId();
        if (!sessionId) return false;

        const provider = this.paymentProviderFactory.getProvider(paymentMethod as any);
        if (!provider) return false;

        try {
            // Simply retry the last operation with the existing session
            const result = await provider.processPayment(sessionId);
            return result.success;
        } catch {
            return false;
        }
    }

    private async handleCancelledPayment(paymentMethod: string): Promise<boolean> {
        // In case of Swish, restart the payment process
        if (paymentMethod === 'swish') {
            return this.refreshPaymentSession(paymentMethod);
        }

        // For other payment methods, let the user restart manually
        return false;
    }

    resetRetryCount(): void {
        this.retryCount = 0;
    }
}