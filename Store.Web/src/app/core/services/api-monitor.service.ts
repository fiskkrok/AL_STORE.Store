// src/app/core/services/api-monitor.service.ts
import { Injectable, inject } from '@angular/core';
import { LoggerService } from './logger.service';

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

@Injectable({ providedIn: 'root' })
export class ApiMonitorService {
    private readonly logger = inject(LoggerService);
    private readonly metrics = new Map<string, EndpointMetrics>();
    private recentRequests: RequestMetrics[] = [];

    // Keep last 100 requests for analysis
    private readonly MAX_REQUEST_HISTORY = 100;

    // Alert threshold for retry rates
    private readonly RETRY_RATE_THRESHOLD = 0.1; // 10%

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
}