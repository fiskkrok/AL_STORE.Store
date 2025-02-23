import { HttpClient } from "@angular/common/http";
import { CartItem } from "../state/cart.store";
import { environment } from "../../../environments/environment";
import { inject, Injectable } from "@angular/core";
import { CheckoutSessionRequest } from "../../shared/models/checkout.model";
import { KlarnaSessionResponse } from "../../shared/models/klarna.model";

@Injectable({ providedIn: 'root' })
export class CheckoutService {
    private readonly http = inject(HttpClient);
    private readonly storeApiUrl = `${environment.apiUrl}/api/checkout`;

    createKlarnaSession(cart: CartItem[], customerInfo: Omit<CheckoutSessionRequest['customer'], 'shippingAddress'> & { shippingAddress: CheckoutSessionRequest['customer']['shippingAddress'] }) {
        const idempotencyKey = this.generateIdempotencyKey(cart);

        const request: CheckoutSessionRequest = {
            items: cart.map(item => ({
                productId: item.productId,
                productName: item.name,
                sku: item.id,
                quantity: item.quantity,
                unitPrice: item.price
            })),
            currency: 'SEK',
            locale: 'sv-SE',
            customer: customerInfo
        };

        return this.http.post<KlarnaSessionResponse>(`${this.storeApiUrl}/sessions`, request, {
            headers: {
                'Idempotency-Key': idempotencyKey
            }
        });
    }

    // If there already is an session id, we can use it to retrieve the session
    getKlarnaSession(sessionId: string) {
        return this.http.get<KlarnaSessionResponse>(`${this.storeApiUrl}/sessions/${sessionId}`);
    }
    private generateIdempotencyKey(cart: CartItem[]): string {
        const cartString = JSON.stringify(cart.map(item => ({
            id: item.id,
            quantity: item.quantity
        })));
        const timestamp = new Date().getTime();
        return btoa(`${cartString}-${timestamp}`);
    }

    authorizePayment(paymentData: { sessionId: string }) {
        return this.http.post<{
            success: boolean;
            orderId?: string;
            error?: {
                code: string;
                message: string;
                details?: unknown;
            };
        }>(`${this.storeApiUrl}/authorize`, paymentData);
    }

    completeOrder(orderId: string) {
        return this.http.post<{
            success: boolean;
            orderConfirmation?: {
                orderNumber: string;
                status: string;
            };
            error?: {
                code: string;
                message: string;
            };
        }>(`${this.storeApiUrl}/complete`, { orderId });
    }
}