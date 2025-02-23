// src/app/core/models/klarna.model.ts
export interface KlarnaSessionRequest {
    purchase_country: string;
    purchase_currency: string;
    locale: string;
    order_amount: number;
    order_tax_amount: number;
    order_lines: {
        name: string;
        quantity: number;
        unit_price: number;
        tax_rate: number;
        total_amount: number;
        total_tax_amount: number;
    }[];
    merchant_urls: {
        authorization: string;
    };
}

export interface KlarnaSessionResponse {
    sessionId: string;
    clientToken: string;
    paymentMethods: PaymentMethod[];
}
export interface PaymentMethod {
    id: string;
    identifier: string;
    name: string;
    assetUrls: {
        descriptive: string;
        standard: string;
    };
    allowed: boolean;
}
export interface KlarnaResponse {
    htmlSnippet: string;
    orderId: string;
    status: 'complete' | 'incomplete' | 'failed';
}