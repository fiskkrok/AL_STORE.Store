// src/app/core/config/klarna.config.ts
export const KLARNA_CONFIG = {
    country: 'SE',
    currency: 'SEK',
    locale: 'sv-SE',
    taxRate: 2500, // 25% in basis points
    merchantName: 'Your Store Name', // Update this
    returnUrl: `${window.location.origin}/checkout/confirmation`,
    termsUrl: `${window.location.origin}/terms`,
    checkoutUrl: `${window.location.origin}/checkout`,
    cancelUrl: `${window.location.origin}/checkout/cancel`
} as const;

// Helper functions for Klarna amount formatting
export const klarnaHelpers = {
    formatAmount(amount: number): number {
        return Math.round(amount * 100);
    },

    calculateTax(amount: number): number {
        return Math.round(amount * (KLARNA_CONFIG.taxRate / 10000));
    }
};