// src/app/core/services/api.service.ts
// imports

import { HttpStatusCode, HttpParams, HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, of, retry, timer, throwError, tap, catchError } from "rxjs";
import { environment } from "../../../environments/environment";
import { LoggerService } from "./logger.service";

@Injectable({ providedIn: 'root' })
export class ApiService {
    private readonly logger = inject(LoggerService);
    private readonly http = inject(HttpClient);

    // Cache configuration
    private readonly cache = new Map<string, CacheEntry<unknown>>();
    private readonly DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Metrics configuration
    private readonly metrics = new Map<string, EndpointMetrics>();
    private recentRequests: RequestMetrics[] = [];
    private readonly MAX_REQUEST_HISTORY = 100;
    private readonly RETRY_RATE_THRESHOLD = 0.1; // 10%

    // API configuration
    private readonly API_URL = environment.apiUrl;
    private readonly API_KEY = environment.apiKey || 'your-api-key';

    private readonly DEFAULT_RETRY_POLICY = {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        retryableErrors: [
            HttpStatusCode.BadGateway,
            HttpStatusCode.ServiceUnavailable,
            HttpStatusCode.GatewayTimeout,
            0 // Network errors often have status 0
        ]
    };

    readonly config = {
        baseUrl: this.API_URL,
        apiKey: this.API_KEY,
        defaultRetryPolicy: this.DEFAULT_RETRY_POLICY,
        endpoints: {
            'products/list': {
                path: '/api/store/products',
                method: 'GET',
                cacheable: true,
                retry: this.DEFAULT_RETRY_POLICY
            },
            'products/detail': {
                path: '/api/store/products/:id',
                method: 'GET',
                cacheable: true,
                retry: this.DEFAULT_RETRY_POLICY
            }
        }
    };

    // CACHE METHODS

    /**
     * Store item in cache with expiration time
     */
    setCache<T>(key: string, data: T, duration = this.DEFAULT_CACHE_DURATION): void {
        const timestamp = Date.now();
        this.cache.set(key, {
            data,
            timestamp,
            expiresAt: timestamp + duration
        });

        // Schedule cleanup
        setTimeout(() => {
            this.cache.delete(key);
        }, duration);
    }

    /**
     * Retrieve item from cache if not expired
     */
    getCache<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T>;

        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    clearCache(): void {
        this.cache.clear();
    }

    removeFromCache(key: string): void {
        this.cache.delete(key);
    }

    // MONITORING METHODS

    /**
     * Track API request metrics
     */
    trackRequest(metrics: RequestMetrics) {
        this.recentRequests.unshift(metrics);
        this.recentRequests = this.recentRequests.slice(0, this.MAX_REQUEST_HISTORY);

        this.updateEndpointMetrics(metrics);
        this.analyzeMetrics(metrics.endpoint);
    }

    private updateEndpointMetrics(request: RequestMetrics) {
        const current = this.metrics.get(request.endpoint) ?? {
            totalCalls: 0,
            failedCalls: 0,
            totalRetries: 0,
            averageDuration: 0,
            errors: {}
        };

        const updatedMetrics = {
            totalCalls: current.totalCalls + 1,
            failedCalls: current.failedCalls + (request.success ? 0 : 1),
            totalRetries: current.totalRetries + request.retryCount,
            averageDuration: (
                (current.averageDuration * current.totalCalls + request.duration) /
                (current.totalCalls + 1)
            ),
            errors: { ...current.errors }
        };

        if (!request.success && request.statusCode) {
            updatedMetrics.errors[request.statusCode] =
                (current.errors[request.statusCode] ?? 0) + 1;
        }

        this.metrics.set(request.endpoint, updatedMetrics);
    }

    private analyzeMetrics(endpoint: string) {
        const metrics = this.metrics.get(endpoint);
        if (!metrics) return;

        // Calculate retry rate
        const retryRate = metrics.totalRetries / metrics.totalCalls;
        if (retryRate > this.RETRY_RATE_THRESHOLD) {
            this.logger.warn(`High retry rate detected for ${endpoint}`, {
                retryRate: retryRate.toFixed(2),
                totalCalls: metrics.totalCalls,
                totalRetries: metrics.totalRetries
            });
        }

        // Analyze error patterns
        const errorRate = metrics.failedCalls / metrics.totalCalls;
        if (errorRate > 0.05) { // 5% error rate threshold
            this.logger.error(`High error rate detected for ${endpoint}`, {
                errorRate: errorRate.toFixed(2),
                errorCounts: metrics.errors
            });
        }

        // Performance monitoring
        if (metrics.averageDuration > 1000) { // 1 second threshold
            this.logger.warn(`Slow endpoint detected: ${endpoint}`, {
                averageDuration: `${metrics.averageDuration.toFixed(0)}ms`
            });
        }
    }

    getEndpointMetrics(endpoint: string): EndpointMetrics | undefined {
        return this.metrics.get(endpoint);
    }

    getEndpointHealth(endpoint: string): 'healthy' | 'degraded' | 'unhealthy' {
        const metrics = this.metrics.get(endpoint);
        if (!metrics || metrics.totalCalls < 10) return 'healthy';

        const errorRate = metrics.failedCalls / metrics.totalCalls;
        const retryRate = metrics.totalRetries / metrics.totalCalls;

        if (errorRate > 0.1 || retryRate > 0.2) return 'unhealthy';
        if (errorRate > 0.05 || retryRate > 0.1) return 'degraded';
        return 'healthy';
    }

    // ENDPOINT MANAGEMENT

    /**
     * Get full URL for a configured endpoint
     */
    getEndpointUrl(key: keyof typeof this.config.endpoints, params: Record<string, string> = {}): string {
        const config = this.config.endpoints[key];
        if (!config) {
            throw new Error(`No configuration found for endpoint: ${key}`);
        }

        let url = `${this.config.baseUrl}${config.path}`;

        // Replace path parameters
        Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`:${key}`, value);
        });

        return url;
    }

    // ENHANCED HTTP METHODS

    /**
     * Enhanced GET with caching, retry, and metrics
     */
    get<T>(endpointKey: keyof typeof this.config.endpoints, params: Record<string, any> = {}, options: {
        skipCache?: boolean;
        forceRefresh?: boolean;
        disableMetrics?: boolean;
    } = {}): Observable<T> {
        const { skipCache = false, forceRefresh = false, disableMetrics = false } = options;
        const url = this.getEndpointUrl(endpointKey, params as any);
        const endpointConfig = this.config.endpoints[endpointKey];

        // Handle cache
        if (!skipCache && endpointConfig.cacheable) {
            const cacheKey = this.createCacheKey(url, params);
            const cachedData = this.getCache<T>(cacheKey);

            if (cachedData && !forceRefresh) {
                if (!disableMetrics) {
                    this.trackRequest({
                        endpoint: endpointKey as string,
                        timestamp: Date.now(),
                        duration: 0,
                        retryCount: 0,
                        success: true,
                        statusCode: 200
                    });
                }
                return of(cachedData);
            }
        }

        // Set up retry logic
        const retryConfig = endpointConfig.retry || this.DEFAULT_RETRY_POLICY;

        // Calculate request start time for metrics
        const startTime = Date.now();
        let retryCount = 0;

        // Create HttpParams
        let httpParams = new HttpParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                httpParams = httpParams.append(key, String(value));
            }
        }

        // Make the request with retries
        return this.http.get<T>(url, {
            params: httpParams,
            headers: new HttpHeaders({
                'X-API-Key': this.config.apiKey
            })
        }).pipe(
            retry({
                count: retryConfig.maxAttempts,
                delay: (error, count) => {
                    retryCount = count;
                    if (retryConfig.retryableErrors.includes(error.status)) {
                        const delay = Math.min(
                            retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, count - 1),
                            retryConfig.maxDelay
                        );
                        return timer(delay);
                    }
                    return throwError(() => error);
                }
            }),
            tap(response => {
                // Cache successful response
                if (endpointConfig.cacheable) {
                    const cacheKey = this.createCacheKey(url, params);
                    this.setCache(cacheKey, response);
                }

                // Track metrics
                if (!disableMetrics) {
                    this.trackRequest({
                        endpoint: endpointKey as string,
                        timestamp: startTime,
                        duration: Date.now() - startTime,
                        retryCount,
                        success: true,
                        statusCode: 200
                    });
                }
            }),
            catchError(error => {
                // Track failed request
                if (!disableMetrics) {
                    this.trackRequest({
                        endpoint: endpointKey as string,
                        timestamp: startTime,
                        duration: Date.now() - startTime,
                        retryCount,
                        success: false,
                        statusCode: error.status,
                        error
                    });
                }
                return throwError(() => error);
            })
        );
    }

    /**
     * Enhanced POST with metrics and retries
     */
    post<T>(endpointKey: keyof typeof this.config.endpoints, body: any, params: Record<string, any> = {}, options: {
        disableMetrics?: boolean
    } = {}): Observable<T> {
        const { disableMetrics = false } = options;
        const url = this.getEndpointUrl(endpointKey, params as any);
        const endpointConfig = this.config.endpoints[endpointKey];

        // Set up retry logic
        const retryConfig = endpointConfig.retry || this.DEFAULT_RETRY_POLICY;

        // Calculate request start time for metrics
        const startTime = Date.now();
        let retryCount = 0;

        // Create HttpParams
        let httpParams = new HttpParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                httpParams = httpParams.append(key, String(value));
            }
        }
        return this.http.post<T>(url, body, {
            headers: new HttpHeaders({
                'X-API-Key': this.config.apiKey
            })
        }).pipe(
            retry({
                count: retryConfig.maxAttempts,
                delay: (error, count) => {
                    retryCount = count;
                    if (retryConfig.retryableErrors.includes(error.status)) {
                        const delay = Math.min(
                            retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, count - 1),
                            retryConfig.maxDelay
                        );
                        return timer(delay);
                    }
                    return throwError(() => error);
                }
            }),
            catchError(error => {
                // Track failed request
                if (!disableMetrics) {
                    this.trackRequest({
                        endpoint: endpointKey as string,
                        timestamp: startTime,
                        duration: Date.now() - startTime,
                        retryCount,
                        success: false,
                        statusCode: error.status,
                        error
                    });
                }
                return throwError(() => error);
            })
        );
    }

    // Helper methods
    private createCacheKey(url: string, params: Record<string, any>): string {
        return `${url}?${JSON.stringify(params)}`;
    }
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface RequestMetrics {
    endpoint: string;
    timestamp: number;
    duration: number;
    retryCount: number;
    success: boolean;
    statusCode?: number;
    error?: unknown;
}

interface EndpointMetrics {
    totalCalls: number;
    failedCalls: number;
    totalRetries: number;
    averageDuration: number;
    errors: Record<string, number>;
}