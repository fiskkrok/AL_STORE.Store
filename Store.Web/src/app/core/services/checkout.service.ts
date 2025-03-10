// src/app/core/services/checkout.service.ts
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Address } from '../../shared/models/address.model';
import { LoggerService } from './logger.service';
import { DeliveryOption } from './delivery.service';
import { CustomerService } from './customer.service';
import { ErrorService } from './error.service';
import { CheckoutSessionRequest, KlarnaSessionResponse } from '../../shared/models';
import { CartItem } from '../state/cart.store';
import { environment } from '../../../environments/environment';
import { AddAddressRequest, AddressFormData } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
    private readonly logger = inject(LoggerService);
    private readonly router = inject(Router);
    private readonly http = inject(HttpClient);
    private readonly errorService = inject(ErrorService);
    private readonly customerService = inject(CustomerService);
    private readonly storeApiUrl = `${environment.apiUrl}/api/checkout`;

    // Session duration constants
    private readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

    // State signals
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

    // Session tracking
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
        // Initialize checkout session
        this.initializeSession();

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

    // Session management
    initializeSession(): void {
        this.checkoutStarted.set(new Date());
        this.logger.info('Checkout session started');
    }

    refreshSession(): void {
        this.checkoutStarted.set(new Date());
        this.logger.info('Checkout session refreshed');
    }

    private handleSessionExpiry(): void {
        this.logger.warn('Checkout session expired');
        this.clearCheckoutState();

        // Redirect to cart page with expiry message
        this.router.navigate(['/cart'], {
            queryParams: { expired: true }
        });
    }

    // Getters
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

    // Setters
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

    // Address management
    async saveNewShippingAddress(data: AddressFormData): Promise<Address> {
        const request: AddAddressRequest = {
            ...data,
            type: 'shipping',
            isDefault: !this.customerService.defaultShippingAddress()
        };

        const address = await this.customerService.addAddress(request);

        // If it's the first address, set it as default
        if (request.isDefault) {
            await this.customerService.setDefaultAddress(address.id, 'shipping');
        }

        // Update checkout state
        this.setShippingAddress(address);

        return address;
    }

    async selectShippingAddress(addressId: string): Promise<Address> {
        const address = this.customerService.customerAddresses().find(a => a.id === addressId);

        if (!address) {
            this.errorService.addError('ADDRESS_NOT_FOUND', 'Address not found', { severity: 'error' });
            throw new Error('Address not found');
        }

        // Update checkout state with full address object
        this.setShippingAddress(address);

        return address;
    }

    async deleteShippingAddress(addressId: string): Promise<void> {
        await this.customerService.deleteAddress(addressId);

        const currentShipping = this.getShippingAddress();
        if (currentShipping?.id === addressId) {
            this.clearCheckoutState();
        }
    }

    // Klarna session management
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

        return this.http.post<KlarnaSessionResponse>(`${this.storeApiUrl}/sessions`, request, {
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

    // Transaction management
    startNewTransaction(): string {
        // Generate a unique transaction ID
        const newId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        this.transactionId.set(newId);
        return newId;
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