// src/app/core/models/address.model.ts
// Consolidate all address-related interfaces here

// Consolidated Address interface
export interface Address {
    id: string;
    type: 'billing' | 'shipping';
    firstName: string;
    lastName: string;
    email?: string;
    street: string;
    streetNumber?: string;
    apartment?: string;
    postalCode: string;
    city: string;
    state: string;
    country: string;
    phone?: string;
    isDefault: boolean;
}

// For forms where address data is collected, excluding the id
export type AddressFormData = Omit<Address, 'id'>;