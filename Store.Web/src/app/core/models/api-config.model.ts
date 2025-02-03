// src/app/core/models/api-config.model.ts
export interface RetryPolicy {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryableErrors: number[]; // HTTP status codes
}

export interface EndpointConfig {
    path: string;
    retry?: RetryPolicy;
    timeout?: number;
    cacheable?: boolean;
    requiresAuth?: boolean;
}

export interface ApiConfig {
    endpoints: Record<string, EndpointConfig>;
    defaultRetryPolicy: RetryPolicy;
}