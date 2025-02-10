/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from "@angular/common/http";
import { CartItem } from "../state/cart.store";
import { environment } from "../../../environments/environment";
import { inject, Injectable } from "@angular/core";
import { CheckoutSessionRequest } from "../models/checkout.model";

// src/app/core/services/checkout.service.ts
@Injectable({ providedIn: 'root' })
export class CheckoutService {
    private readonly http = inject(HttpClient);
    private readonly storeApiUrl = `${environment.apiUrl}/api/checkout`;

    createKlarnaSession(cart: CartItem[], customerInfo: Omit<CheckoutSessionRequest['customer'], 'shippingAddress'> & { shippingAddress: CheckoutSessionRequest['customer']['shippingAddress'] }) {
        // Generate idempotency key based on cart contents and timestamp
        const idempotencyKey = this.generateIdempotencyKey(cart);

        const request: CheckoutSessionRequest = {
            items: cart.map(item => ({
                productId: item.productId,
                productName: item.name,
                sku: item.id, // Assuming we have SKU, might need to adjust
                quantity: item.quantity,
                unitPrice: item.price
            })),
            currency: 'SEK', // Or get from environment/config
            locale: 'sv-SE', // Or get from environment/config
            customer: customerInfo
        };

        return this.http.post<{
            clientToken: string;
            sessionId: string;
            paymentMethods: { identifier: string; name: string; }[];
        }>(`${this.storeApiUrl}/sessions`, request, {
            headers: {
                'Idempotency-Key': idempotencyKey
            }
        });
    }

    private generateIdempotencyKey(cart: CartItem[]): string {
        // Create a deterministic key based on cart contents and timestamp
        const cartString = JSON.stringify(cart.map(item => ({
            id: item.id,
            quantity: item.quantity
        })));
        const timestamp = new Date().getTime();
        return btoa(`${cartString}-${timestamp}`);
    }

    // Backend handles the authorization
    authorizePayment(paymentData: any) {
        return this.http.post<{
            success: boolean;
            orderId?: string;
            error?: string;
        }>(`${this.storeApiUrl}/authorize`, paymentData);
    }

    // Backend validates and processes the order
    completeOrder(orderId: string) {
        return this.http.post<{
            success: boolean;
            orderConfirmation?: {
                orderNumber: string;
                status: string;
            };
        }>(`${this.storeApiUrl}/complete`, { orderId });
    }
}