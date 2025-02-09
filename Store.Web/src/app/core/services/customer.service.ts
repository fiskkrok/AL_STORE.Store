import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';
import {
    CustomerProfile,
    AddAddressRequest,
    UpdateAddressRequest,
    UpdateCustomerProfileRequest,
    CustomerProfileResponse,
    AddressResponse,
    Address,
    CreateProfileRequest
} from '../models/customer.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomerService {
    private readonly http = inject(HttpClient);
    private auth: AuthService | null = null;
    private readonly errorService = inject(ErrorService);
    private readonly apiUrl = `${environment.apiUrl}/api/customers`;

    // State
    private readonly profile = signal<CustomerProfile | null>(null);
    private readonly addresses = signal<Address[]>([]);
    private readonly loading = signal(false);
    private readonly error = signal<string | null>(null);

    // Public signals
    readonly customerProfile = computed(() => this.profile());
    readonly customerAddresses = computed(() => this.addresses());
    readonly isLoading = computed(() => this.loading());
    readonly currentError = computed(() => this.error());

    // Public selectors
    readonly defaultShippingAddress = computed(() =>
        this.addresses().find(a => a.type === 'shipping' && a.isDefault)
    );

    readonly defaultBillingAddress = computed(() =>
        this.addresses().find(a => a.type === 'billing' && a.isDefault)
    );

    setAuthService(authService: AuthService) {
        this.auth = authService;
        this.auth.isAuthenticated$.subscribe(isAuthenticated => {
            if (isAuthenticated) {
                this.handleAuthenticated();
            } else {
                this.handleUnauthenticated();
            }
        });
    }

    private handleAuthenticated(): void {
        this.loadProfile();
    }

    private handleUnauthenticated(): void {
        this.profile.set(null);
        this.addresses.set([]);
    }

    async loadProfile(): Promise<void> {
        this.loading.set(true);
        try {
            const response = await firstValueFrom(this.http.get<CustomerProfileResponse>(
                `${this.apiUrl}/profile`
            ));

            if (response?.profile) {
                this.profile.set(response.profile);
            }
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'status' in error && (error as { status?: number }).status === 404) {
                throw error;
            } else {
                this.errorService.addError(
                    'PROFILE_LOAD_ERROR',
                    'Failed to load customer profile',
                );
            }
        } finally {
            this.loading.set(false);
        }
    }

    async createProfile(profile: CreateProfileRequest): Promise<void> {
        this.loading.set(true);
        try {
            await firstValueFrom(this.http.post(`${this.apiUrl}/profile`, profile));
        } catch (error) {
            this.errorService.addError(
                'PROFILE_CREATE_ERROR',
                'Failed to create customer profile'
            );
            throw error;
        } finally {
            this.loading.set(false);
        }
    }

    async updateProfile(updates: UpdateCustomerProfileRequest): Promise<void> {
        this.loading.set(true);
        try {
            const response = await firstValueFrom(this.http.patch<CustomerProfileResponse>(
                `${this.apiUrl}/profile`,
                updates
            ));

            if (response?.profile) {
                this.profile.set(response.profile);
            }
        } catch (error) {
            this.errorService.addError(
                'PROFILE_UPDATE_ERROR',
                'Failed to update profile'
            );
            throw error;
        } finally {
            this.loading.set(false);
        }
    }

    async addAddress(address: AddAddressRequest): Promise<void> {
        this.loading.set(true);
        try {
            const response = await firstValueFrom(this.http.post<AddressResponse>(
                `${this.apiUrl}/addresses`,
                address
            ));

            if (response?.address && this.profile()) {
                this.profile.update(profile => ({
                    ...profile!,
                    addresses: [...profile!.addresses, response.address]
                }));
            }
        } catch (error) {
            this.errorService.addError(
                'ADDRESS_ADD_ERROR',
                'Failed to add address'
            );
            throw error;
        } finally {
            this.loading.set(false);
        }
    }

    async updateAddress(addressId: string, updates: UpdateAddressRequest): Promise<void> {
        this.loading.set(true);
        try {
            const response = await firstValueFrom(this.http.patch<AddressResponse>(
                `${this.apiUrl}/addresses/${addressId}`,
                updates
            ));

            if (response?.address && this.profile()) {
                this.profile.update(profile => ({
                    ...profile!,
                    addresses: profile!.addresses.map(addr =>
                        addr.id === addressId ? response.address : addr
                    )
                }));
            }
        } catch (error) {
            this.errorService.addError(
                'ADDRESS_UPDATE_ERROR',
                'Failed to update address'
            );
            throw error;
        } finally {
            this.loading.set(false);
        }
    }

    async deleteAddress(addressId: string): Promise<void> {
        this.loading.set(true);
        try {
            await firstValueFrom(this.http.delete(
                `${this.apiUrl}/addresses/${addressId}`
            ));

            if (this.profile()) {
                this.profile.update(profile => ({
                    ...profile!,
                    addresses: profile!.addresses.filter(addr => addr.id !== addressId)
                }));
            }
        } catch (error) {
            this.errorService.addError(
                'ADDRESS_DELETE_ERROR',
                'Failed to delete address'
            );
            throw error;
        } finally {
            this.loading.set(false);
        }
    }

    async setDefaultAddress(addressId: string, type: 'shipping' | 'billing'): Promise<void> {
        this.loading.set(true);
        try {
            await firstValueFrom(this.http.post(
                `${this.apiUrl}/addresses/${addressId}/default`,
                { type }
            ));

            if (this.profile()) {
                this.profile.update(profile => ({
                    ...profile!,
                    ...(type === 'shipping'
                        ? { defaultShippingAddressId: addressId }
                        : { defaultBillingAddressId: addressId })
                }));
            }
        } catch (error) {
            this.errorService.addError(
                'DEFAULT_ADDRESS_ERROR',
                `Failed to set default ${type} address`
            );
            throw error;
        } finally {
            this.loading.set(false);
        }
    }
}