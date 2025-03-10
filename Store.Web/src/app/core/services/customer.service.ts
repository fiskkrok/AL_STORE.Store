import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, firstValueFrom, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';

import { UserService } from './user.service';
import { AddAddressRequest, Address, ApiError, CreateProfileRequest, CustomerProfile, CustomerProfileResponse, UpdateCustomerProfileRequest } from '../../shared/models';
import { AddressService } from './address.service';

@Injectable({ providedIn: 'root' })
export class CustomerService {
    private readonly addressService = inject(AddressService);
    private readonly http = inject(HttpClient);
    private readonly errorService = inject(ErrorService);
    private readonly storeApiUrl = `${environment.apiUrl}/api/customers`;
    private auth: AuthService | null = null;
    private readonly userService = inject(UserService);
    // State
    profile = signal<CustomerProfile | null>(null);
    private readonly addresses = signal<Address[]>([]);
    private readonly loading = signal(false);
    private readonly error = signal<string | null>(null);
    private readonly guestEmail = signal<string | null>(null);

    // Computed values
    readonly customerProfile = computed(() => this.profile());
    readonly isLoading = computed(() => this.loading());
    readonly currentError = computed(() => this.error());
    readonly isGuest = computed(() => !this.auth?.isAuthenticated() && !!this.guestEmail());

    get customerAddresses() {
        return this.addressService.customerAddresses;
    }

    get defaultShippingAddress() {
        return this.addressService.defaultShippingAddress;
    }

    get defaultBillingAddress() {
        return this.addressService.defaultBillingAddress;
    }

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
            const exist = await this.checkProfileExists();
            if (!exist) {
                const userInfo = await firstValueFrom(this.userService.getUserInfo());
                const createProfileRequest: CreateProfileRequest = { // Assuming CreateProfileRequest interface
                    firstName: userInfo.given_name, // Map userinfo fields to your profile model
                    lastName: userInfo.family_name,
                    email: userInfo.email,
                    auth0Id: userInfo.sub, // Store Auth0 user ID
                    // ... map other relevant userinfo fields to your CreateProfileRequest
                };
                await this.createProfile(createProfileRequest);
            } else {
                // Load profile if it exists
                await this.loadProfile();
            }


        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }
    initiateGuestCheckout(email: string) {
        this.guestEmail.set(email);
        return this.checkProfileExists();

    }

    testAuth() {
        this.http.get('https://localhost:5001/api/auth/test').subscribe({
            next: () => console.log('Auth test succeeded'),
            error: (err) => console.error('Auth test failed:', err)
        });
    }
    async checkProfileExists(): Promise<boolean> {
        // Guard against calling this when not authenticated
        const auth = this.auth?.isAuthenticated();
        if (!auth) {
            return false; // Or handle unauthenticated case as needed
        }

        this.loading.set(true);
        this.error.set(null);

        try {
            const response = await firstValueFrom(
                this.http.get(`${this.storeApiUrl}/profile/exists`, { observe: 'response' }) // Use observe: 'response' to get full response
            );
            return response.status === 200; // Assuming 200 OK means profile exists
        } catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 404) {
                return false; // 404 means profile doesn't exist
            }
            // Handle other errors (e.g., network issues) - maybe log and return false or throw an error
            console.error('Error checking profile existence:', error);
            return false; // Or throw error depending on your error handling strategy
        } finally {
            this.loading.set(false);
        }
    }
    async loadProfile(): Promise<void> {
        // Guard against calling this when not authenticated
        const auth = this.auth?.isAuthenticated();
        if (!auth) {
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        try {
            const response = await firstValueFrom(
                this.http.get<CustomerProfileResponse>(`${this.storeApiUrl}/profile`)
            );
            await this.addressService.loadAddresses();
            if (response?.profile) {
                this.profile.set(response.profile);
            }
        } catch (error) {
            // Only handle non-auth errors here since Auth0 handles auth errors
            if (error instanceof HttpErrorResponse && error.status !== 401) {
                this.handleHttpError(error);
            }
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
        // First check if we have details with errors
        if (apiError.details && 'errors' in apiError.details) {
            const errorDetails = apiError.details as { errors: Record<string, string[]> };
            const messages = Object.entries(errorDetails.errors)
                .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(', ')}`)
                .join('\n');
            this.error.set(messages);
            return;
        }

        // Fallback to generic error message
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

    // Address operations delegate to address service
    addAddress(request: AddAddressRequest): Promise<Address> {
        return this.addressService.addAddress(request);
    }

    hasAddressInProfile(address: Partial<Address>): boolean {
        return this.addressService.hasAddressInProfile(address);
    }

    updateAddress(id: string, updates: Partial<AddAddressRequest>): Promise<Address> {
        return this.addressService.updateAddress(id, updates);
    }

    deleteAddress(id: string): Promise<void> {
        return this.addressService.deleteAddress(id);
    }

    setDefaultAddress(addressId: string, type: 'shipping' | 'billing'): Promise<void> {
        return this.addressService.setDefaultAddress(addressId, type);
    }
    getAddress() {
        return this.profile()?.addresses.find(a => a.isDefault
            && a.type === 'shipping');

    }

    getAddressById(addressId: string): Address | undefined {
        return this.addressService.getAddressById(addressId);
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