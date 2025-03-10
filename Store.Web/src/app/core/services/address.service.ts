// src/app/core/services/address.service.ts
// imports

import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject, signal, computed } from "@angular/core";
import { firstValueFrom, catchError, of } from "rxjs";
import { environment } from "../../../environments/environment";
import { Address, AddAddressRequest } from "../../shared/models";
import { ErrorService } from "./error.service";
import { LoggerService } from "./logger.service";

@Injectable({ providedIn: 'root' })
export class AddressService {
    private readonly http = inject(HttpClient);
    private readonly errorService = inject(ErrorService);
    private readonly logger = inject(LoggerService);
    private readonly apiUrl = `${environment.apiUrl}/api/customers`;

    // State
    private readonly addresses = signal<Address[]>([]);

    // Public computed values
    readonly customerAddresses = computed(() => this.addresses());

    readonly defaultShippingAddress = computed(() =>
        this.addresses().find(a => a.type === 'shipping' && a.isDefault)
    );

    readonly defaultBillingAddress = computed(() =>
        this.addresses().find(a => a.type === 'billing' && a.isDefault)
    );

    /**
     * Load addresses from the API
     */
    async loadAddresses(customerId?: string): Promise<void> {
        // Track loading state for UI
        try {
            const endpoint = customerId
                ? `${this.apiUrl}/${customerId}/addresses`
                : `${this.apiUrl}/addresses`;

            const response = await firstValueFrom(
                this.http.get<Address[]>(endpoint).pipe(
                    catchError((error: HttpErrorResponse) => {
                        if (error.status === 404) {
                            return of([]);
                        }
                        throw error;
                    })
                )
            );

            this.addresses.set(response || []);
            this.logger.info(`Loaded ${response?.length || 0} addresses`);
        } catch (error) {
            this.handleError('Failed to load addresses', error);
            throw error;
        }
    }

    /**
     * Add a new address
     */
    async addAddress(request: AddAddressRequest): Promise<Address> {
        const fullRequest = {
            ...request,
            type: request.type ?? 'shipping',
            state: request.state ?? '' // For countries without states
        };

        try {
            const response = await firstValueFrom(
                this.http.post<Address>(`${this.apiUrl}/addresses`, fullRequest)
            );

            // Update local state
            this.addresses.update(addresses => [...addresses, response]);
            this.logger.info('Address added', { address: response });

            return response;
        } catch (error) {
            this.handleError('Failed to add address', error);
            throw error;
        }
    }

    /**
     * Update an existing address
     */
    async updateAddress(id: string, updates: Partial<AddAddressRequest>): Promise<Address> {
        try {
            const response = await firstValueFrom(
                this.http.patch<Address>(`${this.apiUrl}/addresses/${id}`, updates)
            );

            // Update local state
            this.addresses.update(addresses =>
                addresses.map(addr => addr.id === id ? response : addr)
            );

            this.logger.info('Address updated', { addressId: id });
            return response;
        } catch (error) {
            this.handleError('Failed to update address', error);
            throw error;
        }
    }

    /**
     * Delete an address
     */
    async deleteAddress(id: string): Promise<void> {
        try {
            await firstValueFrom(
                this.http.delete(`${this.apiUrl}/addresses/${id}`)
            );

            // Update local state
            this.addresses.update(addresses =>
                addresses.filter(addr => addr.id !== id)
            );

            this.logger.info('Address deleted', { addressId: id });
        } catch (error) {
            this.handleError('Failed to delete address', error);
            throw error;
        }
    }

    /**
     * Set an address as default for a specific type
     */
    async setDefaultAddress(addressId: string, type: 'shipping' | 'billing'): Promise<void> {
        try {
            await firstValueFrom(
                this.http.post(`${this.apiUrl}/addresses/${addressId}/default`, { type })
            );

            // Update local state - reset all defaults for this type then set the new default
            this.addresses.update(addresses => {
                return addresses.map(addr => {
                    if (addr.type === type) {
                        return { ...addr, isDefault: addr.id === addressId };
                    }
                    return addr;
                });
            });

            this.logger.info(`Set default ${type} address`, { addressId });
        } catch (error) {
            this.handleError(`Failed to set default ${type} address`, error);
            throw error;
        }
    }

    /**
     * Check if an address already exists
     */
    hasAddressInProfile(address: Partial<Address>): boolean {
        return this.addresses().some(addr =>
            addr.street === address.street &&
            addr.city === address.city &&
            addr.postalCode === address.postalCode
        );
    }

    /**
     * Get address by ID
     */
    getAddressById(addressId: string): Address | undefined {
        return this.addresses().find(a => a.id === addressId);
    }

    /**
     * Validate an address format
     */
    validateAddress(address: Partial<Address>): string[] {
        const errors: string[] = [];

        if (!address.street) errors.push('Street is required');
        if (!address.city) errors.push('City is required');
        if (!address.postalCode) errors.push('Postal code is required');
        if (!address.country) errors.push('Country is required');

        // Country-specific validation
        if (address.country === 'SE') {
            // Swedish postal code validation (5 digits, optionally with space)
            const postalCode = address.postalCode || '';
            if (!/^\d{3}\s?\d{2}$/.test(postalCode)) {
                errors.push('Invalid Swedish postal code format (should be NNN NN)');
            }
        }

        return errors;
    }

    /**
     * Format address for display
     */
    formatAddress(address: Address): string {
        const lines = [
            `${address.firstName} ${address.lastName}`,
            address.street,
            `${address.city}, ${address.postalCode}`,
            address.country
        ];

        return lines.filter(Boolean).join('\n');
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, error);

        this.errorService.addError(
            'ADDRESS_ERROR',
            message,
            { severity: 'error', context: { error } }
        );
    }
}