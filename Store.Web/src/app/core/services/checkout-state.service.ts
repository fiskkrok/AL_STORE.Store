// src/app/core/services/checkout-state.service.ts

import { Injectable, signal } from '@angular/core';
import { CheckoutInformation } from '../../shared/models/checkout.model';
import { Address } from '../../shared/models/address.model';


interface CheckoutState {
    shippingAddress: Address | null;
    billingAddress: Address | null;
    guestEmail: string | null;
    isComplete: boolean;
}

@Injectable({ providedIn: 'root' })
export class CheckoutStateService {
    getShippingAddress(): Address | null {
        return this.state().shippingAddress;
    }
    private readonly state = signal<CheckoutState>({
        shippingAddress: null,
        billingAddress: null,
        guestEmail: null,
        isComplete: false
    });

    setShippingAddress(address: Address) {
        console.log('Setting shipping address:', address); // Debug log
        this.state.update(s => ({
            ...s,
            shippingAddress: { ...address } // Make sure we're creating a new object
        }));
    }

    setBillingAddress(address: Address) {
        this.state.update(s => ({
            ...s,
            billingAddress: address
        }));
    }

    setGuestEmail(email: string) {
        this.state.update(s => ({
            ...s,
            guestEmail: email
        }));
    }

    // Returns comprehensive shipping information for checkout
    getShippingInformation(): CheckoutInformation | null {
        const state = this.state();

        if (!state.shippingAddress && !state.guestEmail) {
            return null;
        }

        const checkoutInfo: CheckoutInformation = {
            id: '',
            type: 'shipping',
            state: '',
            isDefault: false,
            firstName: state.shippingAddress?.firstName ?? '',
            lastName: state.shippingAddress?.lastName ?? '',
            email: state.guestEmail ?? '',
            phone: state.shippingAddress?.phone,
            street: state.shippingAddress?.street ?? '',
            city: state.shippingAddress?.city ?? '',
            postalCode: state.shippingAddress?.postalCode ?? '',
            country: state.shippingAddress?.country ?? '',
            discountCode: undefined,
        };

        return checkoutInfo;
    }

    hasShippingInformation(): boolean {
        const state = this.state();
        return !!state.shippingAddress || !!state.guestEmail;
    }

    getGuestEmail(): string | null {
        return this.state().guestEmail;
    }

    isCheckoutComplete(): boolean {
        return this.state().isComplete;
    }

    markCheckoutComplete() {
        this.state.update(s => ({
            ...s,
            isComplete: true
        }));
    }

    clearCheckoutState() {
        this.state.set({
            shippingAddress: null,
            billingAddress: null,
            guestEmail: null,
            isComplete: false
        });
    }

    // Helper method to copy shipping address to billing
    useShippingAsBilling() {
        const { shippingAddress } = this.state();
        if (shippingAddress) {
            this.setBillingAddress(shippingAddress);
        }
    }
    getFormattedShippingAddress(): string | null {
        const address = this.state().shippingAddress;
        if (!address) return null;

        const parts = [
            `${address.firstName} ${address.lastName}`,
            address.street + (address.streetNumber ? ` ${address.streetNumber}` : ''),
            address.apartment ? `Apt ${address.apartment}` : '',
            `${address.postalCode} ${address.city}`,
            address.country
        ].filter(Boolean);

        return parts.join(', ');
    }
    // Get current state for debugging/logging
    getDebugState() {
        return this.state();
    }
}