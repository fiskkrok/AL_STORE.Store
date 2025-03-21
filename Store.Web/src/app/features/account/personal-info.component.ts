import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../core/services/customer.service';
import { CustomerProfile, UpdateCustomerProfileRequest } from '../../shared/models/customer.model';
import { LoadingSpinnerComponent } from '../../core/components/loading-spinner.component';

@Component({
    selector: 'app-personal-info',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
    template: `
        <div class="personal-info w-full">
            <h2 class="text-xl font-semibold mb-4">Personal Information</h2>
            
            @if (customerService.isLoading()) {
                <div class="flex justify-center">
                    <app-loading-spinner />
                </div>
            } @else if (customerService.customerProfile()) {
                <div class="bg-card rounded-md shadow-sm p-6">
                    @if (isEditing()) {
                        <form [formGroup]="profileForm" (ngSubmit)="saveChanges()" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="form-group">
                                    <label for="firstName" class="block text-sm font-medium mb-1">First Name</label>
                                    <input 
                                        id="firstName" 
                                        type="text" 
                                        formControlName="firstName"
                                        class="w-full p-2 border rounded-md" 
                                    />
                                </div>
                                
                                <div class="form-group">
                                    <label for="lastName" class="block text-sm font-medium mb-1">Last Name</label>
                                    <input 
                                        id="lastName" 
                                        type="text" 
                                        formControlName="lastName"
                                        class="w-full p-2 border rounded-md" 
                                    />
                                </div>
                                
                                <div class="form-group">
                                    <label for="email" class="block text-sm font-medium mb-1">Email</label>
                                    <input 
                                        id="email" 
                                        type="email" 
                                        formControlName="email"
                                        class="w-full p-2 border rounded-md bg-gray-100" 
                                        readonly
                                    />
                                    <p class="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                                </div>
                                
                                <div class="form-group">
                                    <label for="phone" class="block text-sm font-medium mb-1">Phone Number</label>
                                    <input 
                                        id="phone" 
                                        type="tel" 
                                        formControlName="phone"
                                        class="w-full p-2 border rounded-md" 
                                        placeholder="+XX XXX XXX XXXX"
                                    />
                                    <p class="text-xs text-muted-foreground mt-1">Format: +46701234567</p>
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
                                    [disabled]="profileForm.invalid || profileForm.pristine || isSaving()"
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
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p class="text-sm font-medium text-muted-foreground">First Name</p>
                                    <p class="mt-1">{{ profile()?.firstName }}</p>
                                </div>
                                
                                <div>
                                    <p class="text-sm font-medium text-muted-foreground">Last Name</p>
                                    <p class="mt-1">{{ profile()?.lastName }}</p>
                                </div>
                                
                                <div>
                                    <p class="text-sm font-medium text-muted-foreground">Email</p>
                                    <p class="mt-1">{{ profile()?.email }}</p>
                                </div>
                                
                                <div>
                                    <p class="text-sm font-medium text-muted-foreground">Phone Number</p>
                                    <p class="mt-1">{{ profile()?.phone || 'Not provided' }}</p>
                                </div>
                            </div>

                            <div class="flex justify-end mt-6">
                                <button 
                                    type="button" 
                                    class="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                                    (click)="startEdit()"
                                >
                                    Edit Information
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
export class PersonalInfoComponent implements OnInit {
    public customerService = inject(CustomerService);
    private readonly fb = inject(FormBuilder);

    profile = signal<CustomerProfile | null>(null);
    isEditing = signal(false);
    isSaving = signal(false);
    profileForm!: FormGroup;

    ngOnInit(): void {
        // Initialize profile data
        this.profile.set(this.customerService.customerProfile());
        this.initForm();
    }

    initForm(): void {
        const profile = this.profile();
        if (!profile) return;

        this.profileForm = this.fb.group({
            firstName: [profile.firstName, [Validators.required]],
            lastName: [profile.lastName, [Validators.required]],
            email: [{ value: profile.email, disabled: true }],
            phone: [profile.phone]
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
        if (this.profileForm.invalid) return;

        this.isSaving.set(true);

        try {
            const formValues = this.profileForm.getRawValue();

            const updateRequest: UpdateCustomerProfileRequest = {
                firstName: formValues.firstName,
                lastName: formValues.lastName,
                phone: formValues.phone
            };

            await this.customerService.updateProfile(updateRequest);

            // Update local profile with latest data
            this.profile.set(this.customerService.customerProfile());
            this.isEditing.set(false);
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            this.isSaving.set(false);
        }
    }
}
