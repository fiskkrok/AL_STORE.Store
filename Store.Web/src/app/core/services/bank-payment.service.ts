import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CartItem } from '../state/cart.store';
import { Observable } from 'rxjs';

interface BankPaymentSessionResponse {
    sessionId: string;
    redirectUrl: string;
}

@Injectable({ providedIn: 'root' })
export class BankPaymentService {
    private readonly http = inject(HttpClient);
    private readonly storeApiUrl = `${environment.apiUrl}/api/bank-payment`;

    createBankPaymentSession(cart: CartItem[]): Observable<BankPaymentSessionResponse> {
        const request = {
            items: cart.map(item => ({
                productId: item.productId,
                productName: item.name,
                sku: item.id,
                quantity: item.quantity,
                unitPrice: item.price
            }))
        };

        return this.http.post<BankPaymentSessionResponse>(`${this.storeApiUrl}/sessions`, request);
    }
}