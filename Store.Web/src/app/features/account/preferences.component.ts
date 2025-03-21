import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { CustomerPreferences, CustomerProfile, UpdateCustomerProfileRequest } from '../../shared/models/customer.model';
import { LoadingSpinnerComponent } from '../../core/components/loading-spinner.component';

@Component({
    standalone: true,
    selector: 'app-preferences',
    imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
    template: `
        <div class="preferences w-full">
            <h2 class="text-xl font-semibold mb-4">Preferences</h2>
            
            @if (customerService.isLoading()) {
                <div class="flex justify-center">
                    <app-loading-spinner />
                </div>
            } @else if (customerService.customerProfile()) {
                <div class="bg-card rounded-md shadow-sm p-6">
                    @if (isEditing()) {
                        <form [formGroup]="preferencesForm" (ngSubmit)="saveChanges()" class="space-y-4">
                            <h3 class="text-lg font-medium mb-3">Language & Currency</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="form-group">
                                    <label for="language" class="block text-sm font-medium mb-1">Preferred Language</label>
                                    <select 
                                        id="language" 
                                        formControlName="preferredLanguage"
                                        class="w-full p-2 border rounded-md"
                                    >
                                        <option value="en">English</option>
                                        <option value="sv">Swedish</option>
                                        <option value="no">Norwegian</option>
                                        <option value="da">Danish</option>
                                        <option value="fi">Finnish</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="currency" class="block text-sm font-medium mb-1">Preferred Currency</label>
                                    <select 
                                        id="currency" 
                                        formControlName="preferredCurrency"
                                        class="w-full p-2 border rounded-md"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="SEK">SEK</option>
                                        <option value="NOK">NOK</option>
                                        <option value="DKK">DKK</option>
                                    </select>
                                </div>
                            </div>

                            <h3 class="text-lg font-medium mt-6 mb-3">Communication Preferences</h3>
                            <div class="space-y-2">
                                <div class="flex items-center">
                                    <input 
                                        id="marketingEmails" 
                                        type="checkbox" 
                                        formControlName="marketingEmails"
                                        class="mr-2" 
                                    />
                                    <label for="marketingEmails" class="text-sm">Receive marketing emails</label>
                                </div>
                                
                                <div class="flex items-center">
                                    <input 
                                        id="orderNotifications" 
                                        type="checkbox" 
                                        formControlName="orderNotifications"
                                        class="mr-2" 
                                    />
                                    <label for="orderNotifications" class="text-sm">Receive order notifications</label>
                                </div>
                                
                                <div class="flex items-center">
                                    <input 
                                        id="newsletterSubscribed" 
                                        type="checkbox" 
                                        formControlName="newsletterSubscribed"
                                        class="mr-2" 
                                    />
                                    <label for="newsletterSubscribed" class="text-sm">Subscribe to newsletter</label>
                                </div>
                            </div>

                            <div class="flex justify-end space-x-3 mt-6">
                                <button 
                                    type="button" 
                                    class="px-4 py-2 border rounded-md hover:bg-gray-100"
                                    (click)="cancelEdit()"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    class="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                                    [disabled]="preferencesForm.pristine || isSaving()"
                                >
                                    @if (isSaving()) {
                                        <span>Saving...</span>
                                    } @else {
                                        <span>Save Changes</span>
                                    }
                                </button>
                            </div>
                        </form>
                    } @else {
                        <div class="space-y-4">
                            <div>
                                <h3 class="text-lg font-medium mb-3">Language & Currency</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p class="text-sm font-medium text-muted-foreground">Preferred Language</p>
                                        <p class="mt-1">{{ getLanguageName(preferences().preferredLanguage) }}</p>
                                    </div>
                                    
                                    <div>
                                        <p class="text-sm font-medium text-muted-foreground">Preferred Currency</p>
                                        <p class="mt-1">{{ preferences().preferredCurrency }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="border-t pt-4 mt-4">
                                <h3 class="text-lg font-medium mb-3">Communication Preferences</h3>
                                <div class="space-y-2">
                                    <div class="flex items-center">
                                        <span class="text-sm font-medium text-muted-foreground mr-2">Marketing Emails:</span>
                                        <span>{{ preferences().marketingEmails ? 'Yes' : 'No' }}</span>
                                    </div>
                                    
                                    <div class="flex items-center">
                                        <span class="text-sm font-medium text-muted-foreground mr-2">Order Notifications:</span>
                                        <span>{{ preferences().orderNotifications ? 'Yes' : 'No' }}</span>
                                    </div>
                                    
                                    <div class="flex items-center">
                                        <span class="text-sm font-medium text-muted-foreground mr-2">Newsletter Subscription:</span>
                                        <span>{{ preferences().newsletterSubscribed ? 'Yes' : 'No' }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-end mt-6">
                                <button 
                                    type="button" 
                                    class="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                                    (click)="startEdit()"
                                >
                                    Edit Preferences
                                </button>
                            </div>
                        </div>
                    }
                </div>
            } @else {
                <div class="bg-card rounded-md shadow-sm p-6 text-center">
                    <p>No profile information found. Please create a profile first.</p>
                </div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesComponent implements OnInit {
    public customerService = inject(CustomerService);
    private readonly fb = inject(FormBuilder);

    profile = signal<CustomerProfile | null>(null);
    preferences = signal<CustomerPreferences>({
        marketingEmails: false,
        orderNotifications: true,
        newsletterSubscribed: false,
        preferredLanguage: 'en',
        preferredCurrency: 'USD'
    });
    isEditing = signal(false);
    isSaving = signal(false);
    preferencesForm!: FormGroup;

    ngOnInit(): void {
        // Initialize profile data
        const profile = this.customerService.customerProfile();
        this.profile.set(profile);

        if (profile) {
            this.preferences.set(profile.preferences);
        }

        this.initForm();
    }

    initForm(): void {
        const prefs = this.preferences();
        if (!prefs) return;

        this.preferencesForm = this.fb.group({
            preferredLanguage: [prefs.preferredLanguage],
            preferredCurrency: [prefs.preferredCurrency],
            marketingEmails: [prefs.marketingEmails],
            orderNotifications: [prefs.orderNotifications],
            newsletterSubscribed: [prefs.newsletterSubscribed]
        });
    }

    startEdit(): void {
        this.isEditing.set(true);
        this.initForm();
    }

    cancelEdit(): void {
        this.isEditing.set(false);
    }

    async saveChanges(): Promise<void> {
        if (this.preferencesForm.pristine) return;

        this.isSaving.set(true);

        try {
            const formValues = this.preferencesForm.value;

            const updateRequest: UpdateCustomerProfileRequest = {
                preferences: {
                    preferredLanguage: formValues.preferredLanguage,
                    preferredCurrency: formValues.preferredCurrency,
                    marketingEmails: formValues.marketingEmails,
                    orderNotifications: formValues.orderNotifications,
                    newsletterSubscribed: formValues.newsletterSubscribed
                }
            };

            await this.customerService.updateProfile(updateRequest);

            // Update local profile with latest data
            const updatedProfile = this.customerService.customerProfile();
            this.profile.set(updatedProfile);

            if (updatedProfile) {
                this.preferences.set(updatedProfile.preferences);
            }

            this.isEditing.set(false);
        } catch (error) {
            console.error('Failed to update preferences', error);
        } finally {
            this.isSaving.set(false);
        }
    }

    getLanguageName(code: string): string {
        const languages: Record<string, string> = {
            'en': 'English',
            'sv': 'Swedish',
            'no': 'Norwegian',
            'da': 'Danish',
            'fi': 'Finnish'
        };

        return languages[code] || code;
    }
}