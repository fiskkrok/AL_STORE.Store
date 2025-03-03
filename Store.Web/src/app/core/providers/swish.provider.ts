import { Injectable, inject, Component, OnInit, Input, Output, EventEmitter, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { PaymentProvider, PaymentResult, PaymentSession } from "../../shared/models";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";


interface SwishResponse {
    qrCode: string;
    paymentReference: string;
}

interface SwishStatus {

    status: 'PAID' | 'CANCELLED' | 'ERROR';
    paymentReference: string;
}


// providers/swish.provider.ts
@Injectable()
export class SwishProvider implements PaymentProvider {
    async initializeSession(amount: number, currency: string): Promise<PaymentSession> {
        throw new Error("Method not implemented.");
    }
    async processPayment(sessionId: string): Promise<PaymentResult> {
        throw new Error("Method not implemented.");
    }
    private readonly http = inject(HttpClient);



    async process(amount: number, currency: string): Promise<PaymentResult> {
        try {
            // Create a Swish payment request
            const response = await firstValueFrom(
                this.http.post<SwishResponse>('/api/payments/swish/create', {
                    amount,
                    currency,
                    message: 'Payment for order', // Customize as needed
                })
            );

            // For Swish, we need to poll for status
            return this.pollSwishStatus(response.paymentReference);
        } catch {
            return {
                success: false,
                error: { code: 'SWISH_ERROR', details: '' },
                message: 'Failed to process Swish payment'
            };
        }
    }

    private async pollSwishStatus(reference: string): Promise<PaymentResult> {
        // In a real app, you might use WebSockets or Server-Sent Events
        // For simplicity, we'll use polling
        return new Promise((resolve) => {
            const checkStatus = async () => {
                try {
                    const status = await firstValueFrom(
                        this.http.get<SwishStatus>(`/api/payments/swish/status/${reference}`)
                    );

                    if (status.status === 'PAID') {
                        resolve({
                            success: true,
                            transactionId: status.paymentReference,
                            message: 'Payment successful'
                        });
                        return;
                    } else if (status.status === 'CANCELLED' || status.status === 'ERROR') {
                        resolve({
                            success: false,
                            error: { code: 'PAYMENT_ERROR', details: status.status },
                            message: 'Payment was cancelled or failed'
                        });
                        return;
                    }

                    // Continue polling
                    setTimeout(checkStatus, 2000);
                } catch {
                    resolve({
                        success: false,
                        error: { code: 'POLLING_ERROR', details: '' },
                        message: 'Failed to check payment status'
                    });
                }
            };

            // Start polling
            checkStatus();
        });
    }
}

@Component({
    selector: 'app-swish-payment',
    standalone: true,
    template: `
    <div class="text-center">
      @if (qrCode()) {
        <div class="mb-4">
          <img [src]="qrCode()" alt="Swish QR Code" class="mx-auto">
          <p class="text-sm text-muted-foreground mt-2">
            Skanna QR-koden med Swish-appen för att betala
          </p>
        </div>
      } @else if (loading()) {
        <div class="py-8">
          <svg class="animate-spin h-8 w-8 mx-auto" xmlns="http://www.w3.org/2000/svg">...</svg>
          <p class="mt-2">Förbereder Swish-betalning...</p>
        </div>
      }
      
      <p class="mt-4">
        Eller öppna Swish manuellt och betala till nummer:
      </p>
      <p class="font-bold text-lg">123 456 7890</p>
      
      <div class="mt-6">
        <button 
          class="px-4 py-2 text-primary border border-primary rounded-md"
          (click)="openSwishApp()"
        >
          Öppna Swish
        </button>
      </div>
    </div>
  `
})
export class SwishPaymentComponent implements OnInit {
    @Input() amount!: number;
    @Output() paymentComplete = new EventEmitter<PaymentResult>();

    private readonly http = inject(HttpClient);

    qrCode = signal<string | null>(null);
    loading = signal(true);

    ngOnInit() {
        this.initializeSwish();
    }

    private async initializeSwish() {
        try {
            const response = await firstValueFrom(
                this.http.post<SwishPaymentResponse>(`${environment.apiUrl}/api/payments/swish/init`, {
                    amount: this.amount,
                    currency: 'SEK'
                })
            );

            this.qrCode.set(response.qrCode);
            this.loading.set(false);

            // Start polling for status
            this.pollPaymentStatus(response.reference);
        } catch {
            this.loading.set(false);
            this.paymentComplete.emit({
                success: false,
                message: 'Failed to initialize Swish payment'
            });
        }
    }

    openSwishApp() {
        // Attempt to open Swish app with deep link
        window.location.href = 'swish://paymentrequest?token=...';
    }

    private async pollPaymentStatus(reference: string) {
        // Implement polling for payment status
        // Will periodically check if payment is completed
    }
}

interface SwishPaymentResponse {
    reference: string;
    qrCode: string;
    status: string;
}