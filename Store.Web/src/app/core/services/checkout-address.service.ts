// src/app/core/services/checkout-address.service.ts

import { Injectable, inject } from '@angular/core';
import { CustomerService } from './customer.service';
import { CheckoutStateService } from './checkout-state.service';
import { ErrorService } from './error.service';
import { AddAddressRequest, Address, AddressFormData } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CheckoutAddressService {
    private readonly customerService = inject(CustomerService);
    private readonly checkoutState = inject(CheckoutStateService);
    private readonly errorService = inject(ErrorService);

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

        return address; // Return the address for the component to use
    }
    async deleteShippingAddress(addressId: string): Promise<void> {
        await this.customerService.deleteAddress(addressId);

        const currentShipping = this.checkoutState.getShippingAddress();
        if (currentShipping?.id === addressId) {
            this.checkoutState.clearCheckoutState();
        }
    }
    async handleAddressSelection(address: Address, saveToProfile = false): Promise<void> {
        try {
            // First handle the checkout selection
            await this.selectShippingAddress(address.id);

            // If requested, save to profile
            if (saveToProfile && !this.customerService.hasAddressInProfile(address)) {
                await this.customerService.addAddress(address);
            }
        } catch (error) {
            this.errorService.addError(
                'ADDRESS_ERROR',
                'Failed to process address selection',
                { severity: 'error', context: { error } }
            );
            throw error;
        }
    }

    setShippingAddress(address: Address) {
        const checkoutAddress: Address = {
            ...address,
            state: address.state ?? ''
        };
        this.checkoutState.setShippingAddress(checkoutAddress);
    }
}