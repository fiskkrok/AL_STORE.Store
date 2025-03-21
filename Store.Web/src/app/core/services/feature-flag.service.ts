// src/app/core/services/feature-flag.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseService } from './base.service';

export interface FeatureFlag {
    name: string;
    enabled: boolean;
    description?: string;
    userGroups?: string[];
    percentage?: number;
}

@Injectable({ providedIn: 'root' })
export class FeatureFlagService extends BaseService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/api/features`;

    // Default feature flags to use in case API is unavailable
    private readonly defaultFlags: Record<string, boolean> = {
        'use-new-checkout': true,
        'enable-klarna-payment': true,
        'enable-swish-payment': false,
        'enable-signalr-realtime': true,
        'show-recommendations': environment.production,
        'enable-reviews': false
    };

    // Store feature flags in a signal for reactivity
    private readonly featureFlags = signal<Record<string, boolean>>(this.defaultFlags);

    /**
     * Initialize the feature flag service by loading flags from API
     */
    initialize(): Promise<void> {
        this.logger.info('Initializing feature flags');

        return new Promise((resolve) => {
            this.loadFeatureFlags().subscribe({
                next: (flags) => {
                    this.updateFlags(flags);
                    this.logger.info('Feature flags initialized successfully');
                    resolve();
                },
                error: (error) => {
                    this.handleServiceError('Failed to load feature flags, using defaults', error, 'feature-flags');
                    resolve();
                }
            });
        });
    }

    /**
     * Check if a feature is enabled
     */
    isEnabled(featureName: string): boolean {
        const isEnabled = this.featureFlags()[featureName] ?? false;
        this.logger.debug(`Feature check: ${featureName}`, { isEnabled });
        return isEnabled;
    }

    /**
     * Get all available feature flags
     */
    getAllFlags(): Record<string, boolean> {
        return { ...this.featureFlags() };
    }

    /**
     * Load feature flags from the API
     */
    private loadFeatureFlags(): Observable<Record<string, boolean>> {
        this.logger.info('Loading feature flags from API');

        return this.http.get<FeatureFlag[]>(this.apiUrl).pipe(
            map(flags => {
                // Convert array to record object
                return flags.reduce((acc, flag) => {
                    acc[flag.name] = flag.enabled;
                    return acc;
                }, {} as Record<string, boolean>);
            }),
            catchError(error => {
                this.handleHttpError('Error loading feature flags', error, 'feature-flags');
                return of(this.defaultFlags);
            }),
            tap(flags => {
                this.logger.info('Loaded feature flags', {
                    flagCount: Object.keys(flags).length,
                    enabledCount: Object.values(flags).filter(Boolean).length
                });
            })
        );
    }

    /**
     * Update feature flags
     */
    private updateFlags(flags: Record<string, boolean>): void {
        // Merge with defaults to ensure all expected flags exist
        const mergedFlags = {
            ...this.defaultFlags,
            ...flags
        };

        this.featureFlags.set(mergedFlags);
        this.logger.debug('Feature flags updated', { flags: mergedFlags });
    }
}