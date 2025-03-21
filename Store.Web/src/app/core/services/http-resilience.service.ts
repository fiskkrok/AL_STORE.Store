// src/app/core/services/http-resilience.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen, catchError, finalize } from 'rxjs/operators';
import { BaseService } from './base.service';

interface RetryConfig {
    maxRetries: number;
    scalingDuration: number;
    excludedStatusCodes: number[];
    maxDuration: number;
}

@Injectable({ providedIn: 'root' })
export class HttpResilienceService extends BaseService {
    // Circuit breaker state
    private circuitState: 'CLOSED' | 'OPEN' | 'HALF-OPEN' = 'CLOSED';
    private failureCount = 0;
    private readonly failureThreshold = 5;
    private readonly resetTimeout = 30000; // 30 seconds
    private nextAttempt = 0;

    /**
     * Applies retry with exponential backoff to an observable
     */
    retryWithBackoff<T>(
        observable: Observable<T>,
        config: Partial<RetryConfig> = {}
    ): Observable<T> {
        const fullConfig: RetryConfig = {
            maxRetries: config.maxRetries || 3,
            scalingDuration: config.scalingDuration || 1000,
            excludedStatusCodes: config.excludedStatusCodes || [400, 401, 403, 404],
            maxDuration: config.maxDuration || 30000 // 30 seconds max delay
        };

        return observable.pipe(
            retryWhen(errors =>
                errors.pipe(
                    mergeMap((error, i) => {
                        const retryAttempt = i + 1;

                        // If we've hit our retry limit or it's a client error we don't want to retry
                        if (
                            retryAttempt > fullConfig.maxRetries ||
                            (error.status && fullConfig.excludedStatusCodes.includes(error.status))
                        ) {
                            return throwError(() => error);
                        }

                        // Log retry attempt
                        this.logger.info(`Retry attempt ${retryAttempt} after ${this.calculateDelay(retryAttempt, fullConfig)}ms`, {
                            retryAttempt,
                            error,
                            statusCode: error.status,
                            url: error.url
                        });

                        // Use exponential backoff for retry
                        const delay = this.calculateDelay(retryAttempt, fullConfig);
                        return timer(delay);
                    })
                )
            ),
            catchError(error => {
                // If all retries failed, log it and rethrow
                this.logger.error('All retry attempts failed', {
                    error,
                    statusCode: error.status,
                    url: error.url
                });
                return throwError(() => error);
            })
        );
    }

    /**
     * Applies circuit breaker pattern to an observable
     */
    withCircuitBreaker<T>(
        observable: Observable<T>,
        serviceKey: string
    ): Observable<T> {
        if (this.isCircuitOpen()) {
            const errorMessage = `Service ${serviceKey} is currently unavailable. Please try again later.`;
            this.logger.warn('Circuit open, rejecting request', { serviceKey });
            return throwError(() => new Error(errorMessage));
        }

        return observable.pipe(
            catchError(error => {
                this.recordFailure();
                this.logger.error(`Request failed for ${serviceKey}`, { error });
                return throwError(() => error);
            }),
            finalize(() => this.recordSuccess())
        );
    }

    /**
     * Calculate delay using exponential backoff with jitter
     */
    private calculateDelay(retryAttempt: number, config: RetryConfig): number {
        // Calculate exponential backoff
        const delay = Math.min(
            config.maxDuration,
            Math.pow(2, retryAttempt) * config.scalingDuration
        );

        // Add jitter to prevent all clients from retrying at the same time
        return delay + Math.floor(Math.random() * 100);
    }

    /**
     * Check if circuit is open (preventing requests)
     */
    private isCircuitOpen(): boolean {
        if (this.circuitState === 'CLOSED') {
            return false;
        }

        if (this.circuitState === 'OPEN') {
            // Check if it's time to try again
            if (Date.now() > this.nextAttempt) {
                this.circuitState = 'HALF-OPEN';
                this.logger.info('Circuit transitioning from OPEN to HALF-OPEN');
                return false;
            }
            return true;
        }

        // In HALF-OPEN state, allow the request
        return false;
    }

    /**
     * Record a failed request
     */
    private recordFailure(): void {
        this.failureCount++;

        if (this.failureCount >= this.failureThreshold) {
            this.circuitState = 'OPEN';
            this.nextAttempt = Date.now() + this.resetTimeout;

            this.errorService.addError(
                'SERVICE_UNAVAILABLE',
                'A service is temporarily unavailable. Some features may not work properly.',
                { severity: 'warning', timeout: 10000 }
            );

            this.logger.warn('Circuit breaker opened', {
                failureCount: this.failureCount,
                nextAttempt: new Date(this.nextAttempt),
                resetTimeout: `${this.resetTimeout / 1000} seconds`
            });
        }
    }

    /**
     * Record a successful request
     */
    private recordSuccess(): void {
        if (this.circuitState === 'HALF-OPEN') {
            this.circuitState = 'CLOSED';
            this.failureCount = 0;
            this.logger.info('Circuit breaker reset to closed state');
        }
    }
}