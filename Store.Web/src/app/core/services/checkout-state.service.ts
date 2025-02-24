// src/app/core/services/checkout-state.service.ts
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Address } from '../../shared/models/address.model';
import { LoggerService } from './logger.service';
import { DeliveryOption } from './delivery.service';

// Enhanced version of our checkout state service
@Injectable({ providedIn: 'root' })
export class CheckoutStateService {
    private readonly logger = inject(LoggerService);
    private readonly router = inject(Router);

    // Private state signals
    private readonly shippingAddress = signal<Address | null>(null);
    private readonly deliveryMethod = signal<DeliveryOption | null>(null);
    private readonly paymentMethod = signal<string | null>(null);
    private readonly paymentSessionId = signal<string | null>(null);
    private readonly guestEmail = signal<string | null>(null);
    private readonly checkoutStarted = signal<Date | null>(null);
    private readonly transactionId = signal<string | null>(null);

    // Public computed state
    readonly hasShippingInformation = computed(() => !!this.shippingAddress());
    readonly hasDeliveryMethod = computed(() => !!this.deliveryMethod());
    readonly hasPaymentMethod = computed(() => !!this.paymentMethod());
    readonly isCheckoutComplete = computed(() =>
        this.hasShippingInformation() &&
        this.hasDeliveryMethod() &&
        this.hasPaymentMethod()
    );

    // Session timeout tracking (30 minutes)
    readonly sessionExpiresAt = computed(() => {
        const startTime = this.checkoutStarted();
        if (!startTime) return null;

        const expiryTime = new Date(startTime);
        expiryTime.setMinutes(expiryTime.getMinutes() + 30);
        return expiryTime;
    });

    readonly sessionExpired = computed(() => {
        const expiryTime = this.sessionExpiresAt();
        if (!expiryTime) return false;

        return new Date() > expiryTime;
    });

    constructor() {
        // Initialize checkout session when first created
        this.startCheckoutSession();

        // Restore state from storage if available
        this.restoreState();

        // Set up auto-save effect
        effect(() => {
            this.persistState();
        });

        // Set up session expiry checking
        effect(() => {
            if (this.sessionExpired()) {
                this.handleSessionExpiry();
            }
        });
    }

    // Public getters
    getShippingAddress(): Address | null {
        return this.shippingAddress();
    }

    getDeliveryMethod(): DeliveryOption | null {
        return this.deliveryMethod();
    }

    getSelectedPaymentMethod(): string | null {
        return this.paymentMethod();
    }

    getPaymentSessionId(): string | null {
        return this.paymentSessionId();
    }

    getGuestEmail(): string | null {
        return this.guestEmail();
    }

    getTransactionId(): string | null {
        return this.transactionId();
    }

    // Public setters
    setShippingAddress(address: Address): void {
        this.shippingAddress.set(address);
        this.logger.info('Shipping address set', { address });
    }

    setDeliveryMethod(method: DeliveryOption): void {
        this.deliveryMethod.set(method);
        this.logger.info('Delivery method set', { method });
    }

    setSelectedPaymentMethod(method: string): void {
        this.paymentMethod.set(method);
        this.logger.info('Payment method set', { method });
    }

    setPaymentSessionId(id: string): void {
        this.paymentSessionId.set(id);
        this.logger.info('Payment session ID set', { id });
    }

    setGuestEmail(email: string): void {
        this.guestEmail.set(email);
        this.logger.info('Guest email set', { email });
    }

    startNewTransaction(): string {
        // Generate a unique transaction ID
        const newId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        this.transactionId.set(newId);
        return newId;
    }

    // Session management
    private startCheckoutSession(): void {
        this.checkoutStarted.set(new Date());
        this.logger.info('Checkout session started');
    }

    private handleSessionExpiry(): void {
        this.logger.warn('Checkout session expired');
        this.clearCheckoutState();

        // Redirect to cart page with expiry message
        this.router.navigate(['/cart'], {
            queryParams: { expired: true }
        });
    }

    refreshSession(): void {
        this.checkoutStarted.set(new Date());
        this.logger.info('Checkout session refreshed');
    }

    // State persistence
    private persistState(): void {
        const state = {
            shippingAddress: this.shippingAddress(),
            deliveryMethod: this.deliveryMethod(),
            paymentMethod: this.paymentMethod(),
            paymentSessionId: this.paymentSessionId(),
            guestEmail: this.guestEmail(),
            checkoutStarted: this.checkoutStarted()?.toISOString(),
            transactionId: this.transactionId()
        };

        sessionStorage.setItem('checkout_state', JSON.stringify(state));
    }

    private restoreState(): void {
        try {
            const savedState = sessionStorage.getItem('checkout_state');
            if (!savedState) return;

            const state = JSON.parse(savedState);

            this.shippingAddress.set(state.shippingAddress);
            this.deliveryMethod.set(state.deliveryMethod);
            this.paymentMethod.set(state.paymentMethod);
            this.paymentSessionId.set(state.paymentSessionId);
            this.guestEmail.set(state.guestEmail);

            if (state.checkoutStarted) {
                this.checkoutStarted.set(new Date(state.checkoutStarted));
            }

            this.transactionId.set(state.transactionId);

            this.logger.info('Checkout state restored');
        } catch (error) {
            this.logger.error('Failed to restore checkout state', { error });
            // On error, clear any corrupted state
            sessionStorage.removeItem('checkout_state');
        }
    }

    clearCheckoutState(): void {
        this.shippingAddress.set(null);
        this.deliveryMethod.set(null);
        this.paymentMethod.set(null);
        this.paymentSessionId.set(null);
        this.guestEmail.set(null);
        this.transactionId.set(null);
        sessionStorage.removeItem('checkout_state');
        this.logger.info('Checkout state cleared');
    }
}