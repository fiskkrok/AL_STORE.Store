import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-information',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
      <div class="space-y-4">
        <div>
          <label class="block dark:text-white form-label text-sm font-medium mb-1" for="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="w-full px-3 py-2 border rounded-md"
            [class.border-red-500]="form.get('email')?.invalid && form.get('email')?.touched"
          />
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <p class="text-sm text-red-500 mt-1">Please enter a valid email address</p>
          }
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block dark:text-white form-label text-sm font-medium mb-1" for="firstName">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              formControlName="firstName"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label class="block dark:text-white form-label text-sm font-medium mb-1" for="lastName">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              formControlName="lastName"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label class="block dark:text-white form-label text-sm font-medium mb-1" for="address">
            Address
          </label>
          <input
            type="text"
            id="address"
            formControlName="address"
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block dark:text-white form-label text-sm font-medium mb-1" for="city">
              City
            </label>
            <input
              type="text"
              id="city"
              formControlName="city"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label class="block dark:text-white form-label text-sm font-medium mb-1" for="postalCode">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              formControlName="postalCode"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          [disabled]="form.invalid || submitting"
        >
          @if (submitting) {
            <span class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Processing...
            </span>
          } @else {
            Continue to Shipping
          }
        </button>
      </div>
    </form>
  `
})
export class CheckoutInformationComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required]
  });

  submitting = false;

  async onSubmit() {
    if (this.form.valid) {
      this.submitting = true;
      try {
        // Save shipping information
        await this.router.navigate(['/checkout/shipping']);
      } finally {
        this.submitting = false;
      }
    }
  }
}