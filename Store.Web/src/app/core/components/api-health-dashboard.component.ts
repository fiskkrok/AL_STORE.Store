/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/core/components/api-health-dashboard.component.ts
import { Component, inject } from '@angular/core';
import { ApiMonitorService } from '../services/api-monitor.service';
import { ApiConfigService } from '../services/api-config.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-api-health-dashboard',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="p-6 space-y-6">
      <h2 class="text-2xl dark:text-white font-bold">API Health Dashboard</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let endpoint of endpoints; trackBy: trackByFn">
          <ng-container *ngIf="getEndpointHealth(endpoint) as health">
            <div class="p-4 rounded-lg border" [ngClass]="getHealthClasses(health)">
              <h3 class="font-medium">{{ endpoint }}</h3>
              <ng-container *ngIf="getMetrics(endpoint) as metrics">
                <div class="mt-2 space-y-1 text-sm">
                  <p>Success Rate: {{ getSuccessRate(metrics) }}%</p>
                  <p>Avg Duration: {{ metrics.averageDuration.toFixed(0) }}ms</p>
                  <p>Total Calls: {{ metrics.totalCalls }}</p>
                  <p>Retry Rate: {{ getRetryRate(metrics) }}%</p>
                </div>
              </ng-container>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class ApiHealthDashboardComponent {
  private monitor = inject(ApiMonitorService);
  private apiConfig = inject(ApiConfigService);

  endpoints = Object.keys(this.apiConfig.config.endpoints);

  getEndpointHealth(endpoint: string) {
    return this.monitor.getEndpointHealth(endpoint);
  }

  getMetrics(endpoint: string) {
    return this.monitor.getEndpointMetrics(endpoint);
  }

  getHealthClasses(health: 'healthy' | 'degraded' | 'unhealthy'): string {
    switch (health) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'unhealthy':
        return 'bg-red-50 border-red-200';
      default:
        return '';
    }
  }

  getSuccessRate(metrics: any): string {
    return ((1 - metrics.failedCalls / metrics.totalCalls) * 100).toFixed(1);
  }

  getRetryRate(metrics: any): string {
    return ((metrics.totalRetries / metrics.totalCalls) * 100).toFixed(1);
  }

  trackByFn(index: number, endpoint: string): string {
    return endpoint;
  }
}