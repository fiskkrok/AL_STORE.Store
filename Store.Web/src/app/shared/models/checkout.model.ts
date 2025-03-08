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
    orderNumber: string;
    created: string;
    status: string;
    totalAmount: number;
    currency: string;
    itemCount: number;
    items: CartItem[];
    shippingAddress: CheckoutAddress;
    billingAddress: CheckoutAddress;
}
export interface OrderHistory {
    id: string;
    orderNumber: string;
    created: string;
    status: string;
    totalAmount: number;
    currency: string;
    itemCount: number;
    orderLineItems: OrderLineItem[];
    shippingAddress: CheckoutAddress;
    billingAddress: CheckoutAddress;
}

export interface OrderLineItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    currency: string;
    productImageUrl: string;
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