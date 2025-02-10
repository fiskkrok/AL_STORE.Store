import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, firstValueFrom, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';
import {
    CustomerProfile,
    Address,
    CreateProfileRequest,
    AddAddressRequest,
    CustomerProfileResponse,
    UpdateCustomerProfileRequest,
    AddressResponse,
    UpdateAddressRequest,
    ApiError
} from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
    private readonly http = inject(HttpClient);
    private readonly errorService = inject(ErrorService);
    private readonly storeApiUrl = `${environment.apiUrl}/api/customers`;
    private auth: AuthService | null = null;

    // State
    private readonly profile = signal<CustomerProfile | null>(null);
    private readonly addresses = signal<Address[]>([]);
    private readonly loading = signal(false);
    private readonly error = signal<string | null>(null);
    private readonly guestEmail = signal<string | null>(null);

    // Computed values
    readonly customerProfile = computed(() => this.profile());
    readonly customerAddresses = computed(() => this.addresses());
    readonly isLoading = computed(() => this.loading());
    readonly currentError = computed(() => this.error());
    readonly isGuest = computed(() => !this.auth?.isAuthenticated() && !!this.guestEmail());

    readonly defaultShippingAddress = computed(() =>
        this.addresses().find(a => a.type === 'shipping' && a.isDefault)
    );

    readonly defaultBillingAddress = computed(() =>
        this.addresses().find(a => a.type === 'billing' && a.isDefault)
    );

    setAuthService(authService: AuthService) {
        this.auth = authService;

        // Subscribe to auth state
        this.auth.isAuthenticated$.subscribe(this.handleAuthStateChange.bind(this));
    }

    private handleAuthStateChange(isAuthenticated: boolean): void {
        if (isAuthenticated) {
            this.loadInitialData();
            return;
        }

        // Clear profile data unless in guest mode
        if (this.guestEmail()) {
            return;
        }

        this.profile.set(null);
        this.addresses.set([]);
    }

    private async loadInitialData() {
        if (!this.auth?.isAuthenticated()) {
            return;
        }

        try {
            await this.loadProfile();
            if (this.profile()) {
                await this.loadAddresses();
            }
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    async loadProfile(): Promise<void> {
        this.loading.set(true);
        this.error.set(null);

        try {
            if (!this.auth?.isAuthenticated()) {
                throw new Error('Not authenticated');
            }

            const response = await firstValueFrom(
                this.http.get<CustomerProfile>(
                    `${this.storeApiUrl}/profile`
                ).pipe(
                    catchError(async (error: HttpErrorResponse) => {
                        // If 404, create a new profile with auth data
                        if (error.status === 404 && this.auth) {
                            const authUser = await firstValueFrom(this.auth.user$ ?? of(null));
                            if (authUser?.email) {
                                const createProfileData: CreateProfileRequest = {
                                    email: authUser.email,
                                    firstName: authUser.given_name ?? '',
                                    lastName: authUser.family_name ?? '',
                                };

                                try {
                                    await this.createProfile(createProfileData);
                                    return this.profile(); // Return the newly created profile
                                } catch (createError) {
                                    console.error('Failed to create profile:', createError);
                                    throw createError;
                                }
                            }
                        }
                        throw error;
                    })
                )
            );

            if (response) {
                this.profile.set(response);
            }
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                this.handleHttpError(error);
            } else {
                this.error.set('An unexpected error occurred');
            }
        } finally {
            this.loading.set(false);
        }
    }

    async loadAddresses(): Promise<void> {
        // Don't attempt to load addresses if we're not authenticated
        if (!this.auth?.isAuthenticated()) return;

        this.loading.set(true);
        this.error.set(null);

        try {
            const response = await firstValueFrom(
                this.http.get<Address[]>(
                    `${this.storeApiUrl}/addresses`
                ).pipe(
                    catchError((error: HttpErrorResponse) => {
                        if (error.status === 404) {
                            return of([]);
                        }
                        throw error;
                    })
                )
            );

            this.addresses.set(response || []);
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                this.handleHttpError(error);
            }
            // Don't rethrow - we've handled it
        } finally {
            this.loading.set(false);
        }
    }

    private handleHttpError(error: HttpErrorResponse): void {
        if (error.status === 401) {
            // Clear local state since the session is invalid
            this.profile.set(null);
            this.addresses.set([]);

            // Notify user and trigger auth flow
            this.errorService.addError('AUTH_ERROR', 'Your session has expired. Please sign in again.', {
                severity: 'warning',
                context: { returnUrl: window.location.pathname }
            });

            // Redirect to login
            this.auth?.login(window.location.pathname);
            return;
        }

        if (error.status === 404) {
            return; // 404 is expected for new users, don't show error
        }

        // Handle API error response
        if (error.error && typeof error.error === 'object') {
            this.handleApiError(error.error as ApiError);
        } else {
            this.error.set('An unexpected error occurred');
        }
    }

    private handleApiError(apiError: ApiError): void {
        if ('type' in apiError) {
            if (apiError.type === 'ValidationError' && 'errors' in apiError) {
                const messages = Object.entries(apiError.errors)
                    .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                    .join('\n');
                this.error.set(messages);
                return;
            }
        }

        this.error.set(apiError.message ?? 'An unexpected error occurred');
    }

    async createProfile(data: CreateProfileRequest): Promise<void> {
        this.loading.set(true);
        this.error.set(null);

        try {
            const profile = await firstValueFrom(
                this.http.post<CustomerProfile>(
                    `${this.storeApiUrl}/profile`,
                    data
                ).pipe(
                    catchError((error: HttpErrorResponse) => {
                        if (error.status === 401) {
                            // Handle unauthorized error
                            this.handleHttpError(error);
                        }
                        return throwError(() => error);
                    })
                )
            );

            if (profile) {
                this.profile.set(profile);
            }
        } catch (error) {
            console.error('Profile creation error:', error);
            if (error instanceof HttpErrorResponse) {
                this.handleHttpError(error);
            } else {
                this.error.set('Failed to create profile');
            }
            throw error;
        } finally {
            this.loading.set(false);
        }
    }

    private handleError(error: HttpErrorResponse) {
        if (!error.error) {
            this.error.set('An unexpected error occurred');
            return throwError(() => error);
        }

        const apiError = error.error as ApiError;

        if (apiError.type === 'ValidationError') {
            // Format validation errors for the UI
            const messages = Object.entries(apiError.message)
                .map(([field, message]) => `${field}: ${message}`)
                .join('\n');
            this.error.set(messages);
        } else {
            this.error.set(apiError.message ?? 'An unexpected error occurred');
        }

        return throwError(() => apiError);
    }

    async updateProfile(updates: UpdateCustomerProfileRequest): Promise<void> {
        this.loading.set(true);
        try {
            const response = await firstValueFrom(this.http.patch<CustomerProfileResponse>(
                `${this.storeApiUrl}/profile`,
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
                `${this.storeApiUrl}/addresses`,
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
                `${this.storeApiUrl}/addresses/${addressId}`,
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
                `${this.storeApiUrl}/addresses/${addressId}`
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
                `${this.storeApiUrl}/addresses/${addressId}/default`,
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
    /**
    * Clears guest session
    */
    clearGuestSession(): void {
        this.guestEmail.set(null);
        this.profile.set(null);
        this.addresses.set([]);
    }
}