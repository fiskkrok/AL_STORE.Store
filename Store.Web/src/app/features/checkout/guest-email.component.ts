// src/app/features/checkout/guest-email.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CustomerService } from '../../core/services/customer.service';
import { CheckoutService } from '../../core/services/checkout.service';

@Component({
    selector: 'app-guest-email',
    standalone: true,
    imports: [ReactiveFormsModule],
    template: `
        <div class="max-w-md mx-auto p-6 ">
            <h2 class="text-lg font-medium mb-4 text-foreground">Enter your email to continue</h2>
            
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
                <div class="form-group">
                    <label for="email" class="block text-sm font-medium mb-1 text-foreground">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        formControlName="email"
                        class="w-full px-3 py-2 border rounded-md"
                        [class.border-red-500]="showError"
                    />
                    @if (showError) {
                        <p class="mt-1 text-sm text-red-500">
                            Please enter a valid email address
                        </p>
                    }
                </div>

                <div class="space-y-4">
                    <button
                        type="submit"
                        class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        [disabled]="isLoading()"
                    >
                        @if (isLoading()) {
                            <span class="flex items-center justify-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Processing...
                            </span>
                        } @else {
                            Continue to Checkout
                        }
                    </button>

                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <span class="w-full border-t"></span>
                        </div>
                        <div class="relative flex justify-center text-xs uppercase">
                            <span class="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        class="w-full px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10"
                        (click)="login()"
                    >
                        Sign in to your account
                    </button>
                </div>
            </form>
        </div>
    `
})
export class GuestEmailComponent {
    private readonly fb = inject(FormBuilder);
    private readonly auth = inject(AuthService);
    private readonly customerService = inject(CustomerService);
    private readonly router = inject(Router);
    private readonly checkoutState = inject(CheckoutService);

    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    isLoading = signal(false);

    get showError(): boolean {
        const control = this.form.get('email');
        return control ? control.invalid && control.touched : false;
    }

    async onSubmit(): Promise<void> {
        if (this.form.invalid) {
            this.form.get('email')?.markAsTouched();
            return;
        }

        this.isLoading.set(true);

        try {
            const email = this.form.get('email')?.value;
            if (!email) return;

            const shouldPromptLogin = await this.customerService.initiateGuestCheckout(email);

            if (shouldPromptLogin) {
                if (await this.showLoginPrompt()) {
                    this.login();
                    return;
                }
            }

            // Store email in checkout state
            this.checkoutState.setGuestEmail(email);

            // Continue to shipping information
            this.router.navigate(['/checkout/information']);
        } finally {
            this.isLoading.set(false);
        }
    }

    private async showLoginPrompt(): Promise<boolean> {
        return confirm(
            'An account exists with this email. Would you like to sign in? ' +
            'Signing in will give you access to your saved addresses and order history.'
        );
    }

    login(): void {
        this.auth.login('/checkout/information');
    }
}