import { CartItem } from "./cart.model";

// src/app/core/models/checkout.model.ts
export interface CheckoutAddress {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface OrderSummary {
    items: CartItem[];
    subtotal: number;
    shipping: number;
    total: number;
}

export interface KlarnaResponse {
    htmlSnippet: string;
    orderId: string;
    status: 'complete' | 'incomplete' | 'failed';
}