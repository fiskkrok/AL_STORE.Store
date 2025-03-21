// src/app/core/services/performance-monitoring.service.ts
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { BaseService } from './base.service';

interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: number;
}

interface RoutePerformance {
    route: string;
    loadTime: number;
    timestamp: number;
}

interface ComponentPerformance {
    componentName: string;
    renderTime: number;
    timestamp: number;
}

interface HttpPerformance {
    url: string;
    method: string;
    duration: number;
    status: number;
    timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class PerformanceMonitoringService extends BaseService {
    private readonly router = inject(Router);

    private navigationStart: number | null = null;
    private metrics: PerformanceMetric[] = [];
    private routePerformance: RoutePerformance[] = [];
    private componentPerformance: ComponentPerformance[] = [];
    private httpPerformance: HttpPerformance[] = [];

    private isMonitoringEnabled = true;
    private readonly maxStoredMetrics = 100;

    constructor() {
        super();
        this.initRouteMonitoring();
        this.initPerformanceObserver();
    }

    /**
     * Enable or disable performance monitoring
     */
    setMonitoringEnabled(enabled: boolean): void {
        this.isMonitoringEnabled = enabled;
    }

    /**
     * Initialize route transition monitoring
     */
    private initRouteMonitoring(): void {
        // Track navigation start time
        this.router.events.pipe(
            filter(event => event instanceof NavigationStart)
        ).subscribe(() => {
            this.navigationStart = performance.now();
        });

        // Calculate navigation time on navigation end
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event) => {
            if (!this.isMonitoringEnabled || !this.navigationStart) return;

            const navigationEnd = performance.now();
            const loadTime = navigationEnd - this.navigationStart;
            const route = (event as NavigationEnd).urlAfterRedirects;

            this.recordRoutePerformance(route, loadTime);
            this.navigationStart = null;
        });
    }

    /**
     * Initialize the Performance Observer API to monitor various web metrics
     */
    private initPerformanceObserver(): void {
        if (typeof PerformanceObserver !== 'undefined') {
            // Monitor long tasks
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    if (!this.isMonitoringEnabled) return;

                    list.getEntries().forEach(entry => {
                        this.recordMetric('long-task', entry.duration);

                        if (entry.duration > 100) {
                            this.logger.warn('Long task detected', {
                                duration: `${entry.duration.toFixed(2)}ms`,
                                timestamp: new Date().toISOString()
                            });
                        }
                    });
                });

                longTaskObserver.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                this.logger.warn('Long task performance monitoring not supported', { error: e });
            }

            // Monitor first paint and first contentful paint
            try {
                const paintObserver = new PerformanceObserver((list) => {
                    if (!this.isMonitoringEnabled) return;

                    list.getEntries().forEach(entry => {
                        this.recordMetric(`paint-${entry.name}`, entry.startTime);

                        this.logger.info(`Paint metric: ${entry.name}`, {
                            startTime: `${entry.startTime.toFixed(2)}ms`,
                            timestamp: new Date().toISOString()
                        });
                    });
                });

                paintObserver.observe({ entryTypes: ['paint'] });
            } catch (e) {
                this.logger.warn('Paint performance monitoring not supported', { error: e });
            }
        }
    }

    /**
     * Record the start time of a component render
     */
    startComponentRender(componentName: string): number {
        if (!this.isMonitoringEnabled) return 0;
        return performance.now();
    }

    /**
     * Record the render time of a component
     */
    endComponentRender(componentName: string, startTime: number): void {
        if (!this.isMonitoringEnabled || !startTime) return;

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        this.recordComponentPerformance(componentName, renderTime);

        if (renderTime > 100) { // More than 100ms is considered slow
            this.logger.warn('Slow component render detected', {
                component: componentName,
                renderTime: `${renderTime.toFixed(2)}ms`
            });
        }
    }

    /**
     * Record HTTP request performance
     */
    recordHttpPerformance(url: string, method: string, duration: number, status: number): void {
        if (!this.isMonitoringEnabled) return;

        this.httpPerformance.push({
            url,
            method,
            duration,
            status,
            timestamp: Date.now()
        });

        // Trim if exceeded max metrics
        if (this.httpPerformance.length > this.maxStoredMetrics) {
            this.httpPerformance.shift();
        }

        if (duration > 1000) { // More than 1 second is slow for HTTP requests
            this.logger.warn('Slow HTTP request detected', {
                url,
                method,
                duration: `${duration.toFixed(2)}ms`,
                status
            });
        }
    }

    /**
     * Record a generic performance metric
     */
    private recordMetric(name: string, value: number): void {
        this.metrics.push({
            name,
            value,
            timestamp: Date.now()
        });

        // Trim if exceeded max metrics
        if (this.metrics.length > this.maxStoredMetrics) {
            this.metrics.shift();
        }
    }

    /**
     * Record route transition performance
     */
    private recordRoutePerformance(route: string, loadTime: number): void {
        this.routePerformance.push({
            route,
            loadTime,
            timestamp: Date.now()
        });

        // Trim if exceeded max metrics
        if (this.routePerformance.length > this.maxStoredMetrics) {
            this.routePerformance.shift();
        }

        this.logger.info(`Route performance: ${route}`, {
            loadTime: `${loadTime.toFixed(2)}ms`
        });
    }

    /**
     * Record component render performance
     */
    private recordComponentPerformance(componentName: string, renderTime: number): void {
        this.componentPerformance.push({
            componentName,
            renderTime,
            timestamp: Date.now()
        });

        // Trim if exceeded max metrics
        if (this.componentPerformance.length > this.maxStoredMetrics) {
            this.componentPerformance.shift();
        }
    }

    /**
     * Get performance metrics for all route navigations
     */
    getRoutePerformance(): RoutePerformance[] {
        return [...this.routePerformance];
    }

    /**
     * Get average load time for a specific route
     */
    getAverageRouteLoadTime(route: string): number {
        const routeMetrics = this.routePerformance.filter(m => m.route === route);
        if (routeMetrics.length === 0) return 0;

        const totalTime = routeMetrics.reduce((sum, metric) => sum + metric.loadTime, 0);
        return totalTime / routeMetrics.length;
    }

    /**
     * Get all HTTP request performance metrics
     */
    getHttpPerformance(): HttpPerformance[] {
        return [...this.httpPerformance];
    }

    /**
     * Get performance metrics for all component renders
     */
    getComponentPerformance(): ComponentPerformance[] {
        return [...this.componentPerformance];
    }

    /**
     * Get all collected metrics
     */
    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }
}