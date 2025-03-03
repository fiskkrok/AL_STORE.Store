// src/app/shared/models/payment.model.ts
export interface PaymentProvider {
    initializeSession(amount: number, currency: string): Promise<PaymentSession>;
    processPayment(sessionId: string): Promise<PaymentResult>;
}

export interface PaymentSession {
    sessionId: string;
    amount: number;
    currency: string;
    status: PaymentSessionStatus;
    expiresAt: Date;
}

export type PaymentSessionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PaymentResult {
    success: boolean;
    message: string;
    transactionId?: string;
    error?: {
        code: string;
        details?: any;
    };
}