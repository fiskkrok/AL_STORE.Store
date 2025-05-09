// src/app/core/services/order.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderConfirmation, OrderHistory, OrderStatus } from '../../shared/models';
import { BaseService } from './base.service';

export interface OrderDetailDto {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    totalAmount: number;
    items: {
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        currency: string;
        productImageUrl: string;
    }[];
    shippingAddress: {
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email: string;
    };
    billingAddress?: {
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email: string;
    };
    paymentMethod: string;
    paymentDetails?: any;
    trackingInfo?: {
        carrier: string;
        trackingNumber: string;
        estimatedDelivery: string;
    };
}

@Injectable({ providedIn: 'root' })
export class OrderService extends BaseService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/api/orders`;

    createOrder(paymentSessionId: string, cartItems: any[]): Observable<OrderConfirmation> {
        this.logger.info('Creating order', { paymentSessionId, cartItemCount: cartItems.length });

        return this.http.post<OrderConfirmation>(`${this.apiUrl}/create`, {
            paymentSessionId,
            items: cartItems
        }).pipe(
            catchError(error => {
                this.handleHttpError('Failed to create order', error, 'order');
                throw new Error('Unable to create your order. Please try again.');
            })
        );
    }

    getConfirmationOrderById(transactionId: string): Observable<{ confirmation: OrderConfirmation } | null> {
        this.logger.info('Fetching order confirmation', { transactionId });

        return this.http.get<{ confirmation: OrderConfirmation }>(`${environment.apiUrl}/api/orders/confirmation/${transactionId}`).pipe(
            catchError(error => {
                this.logger.warn('Order confirmation not found', { transactionId, error });
                return of(null);
            })
        );
    }

    getOrderStatus(orderNumber: string): Observable<OrderStatus> {
        this.logger.info('Checking order status', { orderNumber });

        return this.http.get<OrderStatus>(`${this.apiUrl}/${orderNumber}/status`).pipe(
            catchError(error => {
                this.handleHttpError(`Failed to get status for order ${orderNumber}`, error, 'order');
                throw error;
            })
        );
    }

    /**
     * Get customer order by ID - requests a specific order with complete details
     * Maps to /customers/orders/{id} endpoint
     */
    getCustomerOrderById(orderId: string): Observable<OrderDetailDto | null> {
        this.logger.info('Fetching customer order details', { orderId });

        return this.http.get<{ order: OrderDetailDto }>(`${environment.apiUrl}/api/customers/orders/${orderId}`).pipe(
            map(response => response.order),
            catchError(error => {
                this.logger.error('Failed to fetch order details', { orderId, error });
                return of(null);
            })
        );
    }

    /**
     * Get all customer orders - fetches the order history for the authenticated customer
     * Maps to /customers/orders endpoint
     */
    getCustomerOrders(): Observable<OrderHistory[]> {
        this.logger.info('Fetching customer order history');

        return this.http.get<{ orders: OrderHistory[] }>(`${environment.apiUrl}/api/customers/orders`).pipe(
            map(response => response.orders),
            catchError(error => {
                this.logger.error('Failed to fetch order history', { error });
                return of([]);
            })
        );
    }

    // For mocking during testing, we'll have a method that creates orders locally
    createMockOrder(cartItems: any[], paymentMethod: string): OrderConfirmation {
        this.logger.info('Creating mock order', {
            itemCount: cartItems.length,
            paymentMethod
        });

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