// src/app/core/providers/payment-provider.factory.ts
import { Injectable, inject } from '@angular/core';
import { KlarnaProvider } from './klarna.provider';
import { SwishProvider } from './swish.provider';
import { PaymentProvider } from '../../shared/models';

export type PaymentMethod = 'klarna' | 'swish' | 'credit_card' | 'bank_payment';

@Injectable({ providedIn: 'root' })
export class PaymentProviderFactory {
    private readonly klarnaProvider = inject(KlarnaProvider);
    private readonly swishProvider = inject(SwishProvider);

    getProvider(method: PaymentMethod): PaymentProvider | null {
        switch (method) {
            case 'klarna': return this.klarnaProvider;
            case 'swish': return this.swishProvider;
            // Future implementation
            case 'credit_card':
            case 'bank_payment':
            default: return null;
        }
    }
}