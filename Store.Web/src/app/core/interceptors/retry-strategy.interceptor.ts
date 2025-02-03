// import { inject } from '@angular/core';
// import { retry, timer, catchError, of } from 'rxjs';
// import { HttpResponse, HttpInterceptorFn } from '@angular/common/http';
// import { ApiConfigService } from '../services/api-config.service';
// import { ApiMonitorService } from '../services/api-monitor.service';
// import { ApiCacheService } from '../services/api-cache.service';

// export const retryStrategyInterceptor: HttpInterceptorFn = (req, next) => {
//     const apiConfig = inject(ApiConfigService);
//     const monitor = inject(ApiMonitorService);
//     const cache = inject(ApiCacheService);

//     const startTime = Date.now();
//     const endpointKey = getEndpointKey(req.url);

//     // If it's a GET request and endpoint is cacheable, check cache
//     if (req.method === 'GET' && endpointKey) {
//         const config = apiConfig.getEndpointConfig(endpointKey);
//         if (config.cacheable) {
//             const cachedData = cache.get(req.url);
//             if (cachedData) {
//                 monitor.trackRequest({
//                     endpoint: endpointKey,
//                     timestamp: Date.now(),
//                     duration: 0,
//                     retryCount: 0,
//                     success: true,
//                     statusCode: 200
//                 });
//                 return of(new HttpResponse({ body: cachedData }));
//             }
//         }
//     }

//     if (!endpointKey) {
//         return next(req);
//     }

//     const retryPolicy = apiConfig.getRetryPolicy(endpointKey);
//     let retryCount = 0;

//     return next(req).pipe(
//         retry({
//             count: retryPolicy.maxAttempts,
//             delay: (error) => {
//                 retryCount++;

//                 if (!apiConfig.shouldRetry(endpointKey, error.status)) {
//                     throw error;
//                 }

//                 const delay = apiConfig.calculateDelay(endpointKey, retryCount);
//                 return timer(delay);
//             }
//         }),
//         catchError(error => {
//             monitor.trackRequest({
//                 endpoint: endpointKey,
//                 timestamp: Date.now(),
//                 duration: Date.now() - startTime,
//                 retryCount,
//                 success: false,
//                 statusCode: error.status,
//                 error
//             });
//             throw error;
//         })
//     );
// };

// // Helper to extract endpoint key from URL
// function getEndpointKey(url: string): string | null {
//     if (url.includes('/api/products')) {
//         return url.includes('/:id') ? 'products/detail' : 'products/list';
//     }
//     if (url.includes('/api/cart')) {
//         return url.includes('/:id') ? 'cart/update' : 'cart/add';
//     }
//     // ... add other mappings
//     return null;
// }