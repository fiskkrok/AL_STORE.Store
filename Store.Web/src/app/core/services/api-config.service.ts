// src/app/core/services/api-config.service.ts
import { Injectable } from '@angular/core';
import { HttpStatusCode } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiConfigService {
    private readonly API_URL = 'https://localhost:5000'; // TODO: Ändra admin/manage till rätt URL
    private readonly API_KEY = 'your-api-key'; // You should store this securely

    private readonly DEFAULT_RETRY_POLICY = {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        retryableErrors: [
            HttpStatusCode.BadGateway,
            HttpStatusCode.ServiceUnavailable,
            HttpStatusCode.GatewayTimeout,
            0
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
}