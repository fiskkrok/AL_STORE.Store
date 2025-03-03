// src/app/core/services/order.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderConfirmation, OrderStatus } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/api/orders`;

    createOrder(paymentSessionId: string, cartItems: any[]): Observable<OrderConfirmation> {
        return this.http.post<OrderConfirmation>(`${this.apiUrl}/create`, {
            paymentSessionId,
            items: cartItems
        }).pipe(
            catchError(error => {
                console.error('Failed to create order:', error);
                throw new Error('Unable to create your order. Please try again.');
            })
        );
    }

    getOrderById(orderNumber: string): Observable<OrderConfirmation | null> {
        return this.http.get<OrderConfirmation>(`${this.apiUrl}/${orderNumber}`).pipe(
            catchError(() => of(null))
        );
    }

    getOrderStatus(orderNumber: string): Observable<OrderStatus> {
        return this.http.get<OrderStatus>(`${this.apiUrl}/${orderNumber}/status`);
    }

    // For mocking during testing, we'll have a method that creates orders locally
    createMockOrder(cartItems: any[], paymentMethod: string): OrderConfirmation {
        return {
            orderNumber: `ORD-${Math.floor(Math.random() * 1000000)}`,
            status: 'confirmed',
            customerEmail: 'customer@example.com',
            items: cartItems.map(item => ({
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            shippingAddress: {
                firstName: 'Test',
                lastName: 'Customer',
                street: 'Testgatan 123',
                city: 'Stockholm',
                postalCode: '12345',
                country: 'SE',
                email: 'customer@example.com',
                id: '',
                type: 'shipping',
                isDefault: false,
                state: ''
            },
            total: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
            paymentMethod,
            createdAt: new Date().toISOString()
        };
    }
}