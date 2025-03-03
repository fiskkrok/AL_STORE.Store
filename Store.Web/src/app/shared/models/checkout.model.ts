// src/app/core/models/checkout.model.ts
import { Address } from './address.model';
import { CartItem } from './cart.model';

export interface CheckoutAddress extends Address {
    addressId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

export interface CheckoutInformation extends Address {
    discountCode?: string;
}

export interface OrderSummary {
    items: CartItem[];
    subtotal: number;
    shipping: number;
    total: number;
}

export interface CheckoutSessionRequest {
    items: {
        productId: string;
        productName: string;
        sku: string;
        quantity: number;
        unitPrice: number;
    }[];
    currency: string;
    locale: string;
    customer: {
        email: string;
        phone?: string;
        shippingAddress: Address;
    }
}

export interface OrderConfirmation {
    orderNumber: string;
    status: string;
    customerEmail: string;
    shippingAddress: CheckoutAddress;
    items: {
        productId: string;
        name: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    createdAt: string;
    paymentMethod: string;
}

export enum OrderStatus {
    Pending = 'pending',
    Confirmed = 'confirmed',
    Shipped = 'shipped',
    Delivered = 'delivered',
    Cancelled = 'cancelled'
}