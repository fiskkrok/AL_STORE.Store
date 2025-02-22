// src/app/core/models/customer.model.ts
import { Address, ApiError } from '.';

export interface CustomerProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    isVerified: boolean;
    createdAt: string;
    lastModified: string | null;
    addresses: Address[];
    preferences: CustomerPreferences;
}

export interface CreateProfileRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    auth0Id: string;
}

export interface AddAddressRequest {
    firstName: string;
    lastName: string;
    phone?: string;
    apartment?: string;
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    type: 'shipping' | 'billing';
    isDefault?: boolean;
}

export interface ValidationError extends ApiError {
    code: 'ValidationError';
    details: {
        errors: Record<string, string[]>;
    };
}

export interface ConflictError extends ApiError {
    code: 'ConflictError';
}

export interface CustomerPreferences {
    marketingEmails: boolean;
    orderNotifications: boolean;
    newsletterSubscribed: boolean;
    preferredLanguage: string;
    preferredCurrency: string;
}

export interface UpdateCustomerProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    preferences?: Partial<CustomerPreferences>;
}

export interface UpdateAddressRequest extends Partial<AddAddressRequest> {
    id: string;
}

export interface CustomerProfileResponse {
    profile: CustomerProfile;
}

export interface AddressResponse {
    address: Address;
}

export interface FieldValidationError {
    field: string;
    message: string;
}

export interface CustomerProfileError {
    code: string;
    message: string;
    validationErrors?: FieldValidationError[];
}