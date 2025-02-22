import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpResponse, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { ApiMonitorService } from '../services/api-monitor.service';
import { ApiCacheService } from '../services/api-cache.service';

export class RetryStrategyInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const monitor = inject(ApiMonitorService);
        const cache = inject(ApiCacheService);

        const endpointKey = getEndpointKey(req.url);

        // If it's a GET request and endpoint is cacheable, check cache
        if (req.method === 'GET' && endpointKey) {
            const cachedData = cache.get(req.url);
            if (cachedData) {
                monitor.trackRequest({
                    endpoint: endpointKey,
                    timestamp: Date.now(),
                    duration: 0,
                    retryCount: 0,
                    success: true,
                    statusCode: 200
                });
                return of(new HttpResponse({ body: cachedData }));
            }
        }

        if (!endpointKey) {
            return next.handle(req);
        }

        return next.handle(req);
    }
}

// Helper to extract endpoint key from URL
function getEndpointKey(url: string): string | null {
    if (url.includes('/api/products')) {
        return url.includes('/:id') ? 'products/detail' : 'products/list';
    }
    if (url.includes('/api/cart')) {
        return url.includes('/:id') ? 'cart/update' : 'cart/add';
    }
    // ... add other mappings
    return null;
}