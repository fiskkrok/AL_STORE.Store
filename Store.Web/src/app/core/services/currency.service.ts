// src/app/core/services/currency.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
    private readonly defaultCurrency = 'SEK';
    private readonly currencySymbols: Record<string, string> = {
        'SEK': 'kr',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'NOK': 'kr',
        'DKK': 'kr'
    };

    /**
     * Format a currency amount with the appropriate symbol
     */
    format(amount: number, currency?: string): string {
        const currencyCode = currency || this.defaultCurrency;
        const symbol = this.currencySymbols[currencyCode] || currencyCode;

        return `${amount.toFixed(2)} ${symbol}`;
    }

    /**
     * Format a currency amount without decimal places if they are zeros
     */
    formatSmartDecimals(amount: number, currency?: string): string {
        const currencyCode = currency || this.defaultCurrency;
        const symbol = this.currencySymbols[currencyCode] || currencyCode;

        // Only show decimal places when needed
        const formatted = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2);

        return `${formatted} ${symbol}`;
    }

    /**
     * Get the default currency used in the application
     */
    getDefaultCurrency(): string {
        return this.defaultCurrency;
    }

    /**
     * Get the symbol for a given currency code
     */
    getCurrencySymbol(currency: string): string {
        return this.currencySymbols[currency] || currency;
    }
}