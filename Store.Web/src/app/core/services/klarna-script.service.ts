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
        return this.scriptLoader.isScriptLoaded(this.KLARNA_SCRIPT_URL);
    }
}