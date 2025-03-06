import { Injectable, signal } from '@angular/core';

declare global {
    interface Window {
        Klarna?: any;
    }
}

@Injectable({
    providedIn: 'root'
})
export class KlarnaScriptService {
    private readonly scriptLoaded = signal(false);

    loadKlarnaScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (window.Klarna) {
                this.scriptLoaded.set(true);
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://x.klarnacdn.net/kp/lib/v1/api.js';
            script.async = true;

            script.onload = () => {
                this.scriptLoaded.set(true);
                resolve();
            };

            script.onerror = () => reject(new Error('Failed to load Klarna script'));
            document.body.appendChild(script);
        });
    }

    loadPaymentWidget(containerId: string, errorCallback: (message: string) => void): void {
        if (!window.Klarna) return;

        window.Klarna.Payments.load({
            container: containerId,
            payment_method_category: 'pay_later'
        }, {}, (res: any) => {
            if (!res.show_form) {
                errorCallback('Selected payment method is not available at this time');
            }
        });
    }

    initializeKlarnaPayments(clientToken: string): void {
        if (window.Klarna) {
            window.Klarna.Payments.init({ client_token: clientToken });
        }
    }

    isScriptLoaded(): boolean {
        return this.scriptLoaded();
    }
}