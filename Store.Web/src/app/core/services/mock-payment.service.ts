// src/app/core/services/mock-payment.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface MockPaymentOptions {
    shouldSucceed?: boolean;
    simulateTimeout?: boolean;
    simulateNetworkError?: boolean;
    simulateExpiredSession?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MockPaymentService {
    mockKlarnaPayment(options: MockPaymentOptions = {}): Observable<any> {
        if (options.simulateNetworkError) {
            return throwError(() => new Error('Network error')).pipe(delay(1000));
        }

        if (options.simulateTimeout) {
            return throwError(() => new Error('Request timeout')).pipe(delay(5000));
        }

        if (options.simulateExpiredSession) {
            return throwError(() => ({
                code: 'SESSION_EXPIRED',
                message: 'The payment session has expired'
            })).pipe(delay(1000));
        }

        // Default to success if not specified
        const shouldSucceed = options.shouldSucceed !== false;

        if (shouldSucceed) {
            return of({
                success: true,
                transactionId: `mock_klarna_${Date.now()}`,
                status: 'AUTHORIZED'
            }).pipe(delay(2000)); // Simulate API delay
        } else {
            return throwError(() => ({
                code: 'PAYMENT_REJECTED',
                message: 'The payment was rejected',
                details: {
                    reason: 'TEST_REJECTION'
                }
            })).pipe(delay(2000));
        }
    }

    mockSwishPayment(options: MockPaymentOptions = {}): Observable<any> {
        if (options.simulateNetworkError) {
            return throwError(() => new Error('Network error')).pipe(delay(1000));
        }

        // Default to success if not specified
        const shouldSucceed = options.shouldSucceed !== false;

        if (shouldSucceed) {
            // Simulate Swish payment flow with QR code
            const qrCode = this.generateMockQrCode();

            return of({
                success: true,
                transactionId: `mock_swish_${Date.now()}`,
                reference: `REF${Math.floor(Math.random() * 1000000)}`,
                qrCode,
                status: 'CREATED'
            }).pipe(delay(1500));
        } else {
            return throwError(() => ({
                code: 'PAYMENT_REJECTED',
                message: 'The payment was rejected',
                details: {
                    reason: 'TEST_REJECTION'
                }
            })).pipe(delay(2000));
        }
    }

    checkSwishStatus(reference: string): Observable<any> {
        // 80% chance of success, 20% of cancellation for testing
        const shouldSucceed = Math.random() < 0.8;

        if (shouldSucceed) {
            return of({
                status: 'PAID',
                paymentReference: reference,
                paidAt: new Date().toISOString()
            }).pipe(delay(2000));
        } else {
            return of({
                status: 'CANCELLED',
                paymentReference: reference
            }).pipe(delay(2000));
        }
    }

    // Helper method to generate a fake QR code URL
    // (in a real app, this would be a base64 encoded image or URL from the API)
    private generateMockQrCode(): string {
        // For testing, we'll use a placeholder image
        return 'assets/mock/swish-qr-code.png';
    }
}