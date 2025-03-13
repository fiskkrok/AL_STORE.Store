// src/app/core/services/klarna-script.service.ts
import { Injectable, inject } from '@angular/core';
import { ScriptLoaderService } from './script-loader.service';

declare global {
    interface Window {
        Klarna?: any;
    }
}

@Injectable({
    providedIn: 'root'
})
export class KlarnaScriptService {
    private readonly scriptLoader = inject(ScriptLoaderService);
    private readonly KLARNA_SCRIPT_URL = 'https://x.klarnacdn.net/kp/lib/v1/api.js';

    loadKlarnaScript(): Promise<void> {
        return this.scriptLoader.loadScript({
            url: this.KLARNA_SCRIPT_URL,
            loadCheck: () => !!window.Klarna
        });
    }

    loadPaymentWidget(containerId: string, errorCallback: (message: string) => void): void {
        if (!window.Klarna) return;

        window.Klarna.Payments.load({
            container: containerId,
            payment_method_category: 'klarna'
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
        return this.scriptLoader.isScriptLoaded(this.KLARNA_SCRIPT_URL);
    }
    authorizeKlarnaPayment(): Promise<{ success: boolean, token?: string, error?: string }> {
        return new Promise((resolve) => {
            if (!window.Klarna) {
                resolve({ success: false, error: 'Klarna is not available' });
                return;
            }

            window.Klarna.Payments.authorize({
                payment_method_category: 'klarna' // Or whatever category you're using
            }, {}, (res: any) => {
                console.log('Klarna authorization result:', res);
                if (res.approved) {
                    resolve({
                        success: true,
                        token: res.authorization_token // Make sure to extract the token correctly
                    });
                } else {
                    resolve({
                        success: false,
                        error: res.error?.message || 'Authorization failed'
                    });
                }
            });
        });
    }
}