// src/app/core/models/customer.model.ts

// src/app/core/models/customer.model.ts

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

export interface Address {
    id: string;
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    type: 'shipping' | 'billing';
    isDefault: boolean;
}

// API Request Types
export interface CreateProfileRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

export interface AddAddressRequest {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    type: 'shipping' | 'billing';
    isDefault?: boolean;
}

// API Error Types
export interface ApiValidationError {
    type: 'ValidationError';
    message: string;
    errors: Record<string, string[]>;
}

export interface ApiConflictError {
    type: 'ConflictError';
    message: string;
}

export type ApiError =
    | ApiValidationError
    | ApiConflictError
    | { type: string; message: string; };

export interface Address {
    id: string;
    type: 'billing' | 'shipping'
    firstName: string;
    lastName: string;
    street: string;
    streetNumber?: string;
    apartment?: string;
    postalCode: string;
    city: string;
    state?: string;
    country: string;
    phone?: string;
    isDefault: boolean;
}

export interface CustomerPreferences {
    marketingEmails: boolean;
    orderNotifications: boolean;
    newsletterSubscribed: boolean;
    preferredLanguage: string;
    preferredCurrency: string;
}

// For creating/updating customer profiles
export interface UpdateCustomerProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    preferences?: Partial<CustomerPreferences>;
}

export interface AddAddressRequest {
    type: Address['type'];
    firstName: string;
    lastName: string;
    street: string;
    streetNumber?: string;
    apartment?: string;
    postalCode: string;
    city: string;
    state?: string;
    country: string;
    phone?: string;
    isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<AddAddressRequest> {
    id: string;
}

// API Responses
export interface CustomerProfileResponse {
    profile: CustomerProfile;
}

export interface AddressResponse {
    address: Address;
}

// Error types
export interface ValidationError {
    field: string;
    message: string;
}

export interface CustomerProfileError {
    code: string;
    message: string;
    validationErrors?: ValidationError[];
}