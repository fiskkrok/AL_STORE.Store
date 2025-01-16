import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../core/state/auth.store';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Profile Settings</h1>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1" for="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1" for="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="w-full px-3 py-2 border rounded-md"
              [readonly]="true"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1" for="phone">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              formControlName="phone"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <button
            type="submit"
            class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            [disabled]="form.invalid || saving"
          >
            @if (saving) {
              <span class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Saving...
              </span>
            } @else {
              Save Changes
            }
          </button>

          <button
            type="button"
            class="px-6 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            (click)="onDeleteAccount()"
          >
            Delete Account
          </button>
        </div>
      </form>
    </div>
  `
})
export class ProfileSettingsComponent {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  saving = false;

  constructor() {
    // Load user profile
    const profile = this.authStore.userProfile();
    if (profile) {
      this.form.patchValue({
        name: profile.name,
        email: profile.email
      });
    }
  }

  async onSubmit() {
    if (this.form.valid) {
      this.saving = true;
      try {
        // Update profile
        await this.authStore.updateProfile(this.form.value);
      } finally {
        this.saving = false;
      }
    }
  }

  async onDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      await this.authStore.deleteAccount();
    }
  }
}