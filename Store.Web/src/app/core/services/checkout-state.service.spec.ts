// src/app/core/services/checkout-state.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { CheckoutStateService } from './checkout-state.service';
import { Address } from '../../shared/models/customer.model';

describe('CheckoutStateService', () => {
    let service: CheckoutStateService;

    const mockAddress: Address = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        street: 'Test Street 1',
        city: 'Stockholm',
        postalCode: '12345',
        country: 'SE',
        phone: '123456789',
        type: 'shipping',
        isDefault: true
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CheckoutStateService]
        });
        service = TestBed.inject(CheckoutStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle shipping address', () => {
        service.setShippingAddress(mockAddress);
        expect(service.hasShippingInformation()).toBe(true);

        const info = service.getShippingInformation();
        expect(info).toBeTruthy();
        expect(info?.street).toBe(mockAddress.street);
    });

    it('should handle guest email', () => {
        service.setGuestEmail('test@example.com');
        expect(service.getGuestEmail()).toBe('test@example.com');
    });

    it('should clear state', () => {
        service.setShippingAddress(mockAddress);
        service.setGuestEmail('test@example.com');

        service.clearCheckoutState();

        expect(service.hasShippingInformation()).toBe(false);
        expect(service.getGuestEmail()).toBeNull();
    });

    it('should copy shipping to billing', () => {
        service.setShippingAddress(mockAddress);
        service.useShippingAsBilling();

        const state = service.getDebugState();
        expect(state.billingAddress).toEqual(state.shippingAddress);
    });

    it('should manage checkout completion state', () => {
        expect(service.isCheckoutComplete()).toBe(false);

        service.markCheckoutComplete();
        expect(service.isCheckoutComplete()).toBe(true);

        service.clearCheckoutState();
        expect(service.isCheckoutComplete()).toBe(false);
    });
});