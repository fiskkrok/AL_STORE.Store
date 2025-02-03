/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from "@angular/common/http";
import { CartItem } from "../state/cart.store";
import { environment } from "../../../environments/environment";
import { inject, Injectable } from "@angular/core";

// src/app/core/services/checkout.service.ts
@Injectable({ providedIn: 'root' })
export class CheckoutService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/checkout`;

    // Now we only send the cart to our backend
    // Backend handles all Klarna API communication
    createKlarnaSession(cart: CartItem[]) {
        return this.http.post<{
            clientToken: string;
            sessionId: string;
            paymentMethods: {
                identifier: string;
                name: string;
            }[];
        }>(`${this.apiUrl}/sessions`, { cart });
    }

    // Backend handles the authorization
    authorizePayment(paymentData: any) {
        return this.http.post<{
            success: boolean;
            orderId?: string;
            error?: string;
        }>(`${this.apiUrl}/authorize`, paymentData);
    }

    // Backend validates and processes the order
    completeOrder(orderId: string) {
        return this.http.post<{
            success: boolean;
            orderConfirmation?: {
                orderNumber: string;
                status: string;
            };
        }>(`${this.apiUrl}/complete`, { orderId });
    }
}