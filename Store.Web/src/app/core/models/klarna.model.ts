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
    session_id: string;
    client_token: string;
    payment_method_categories: {
        identifier: string;
        name: string;
    }[];
}