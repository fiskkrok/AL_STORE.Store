// src/app/core/services/logger.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggerService {
    private readonly isProduction = environment.production;

    error(message: string, error?: unknown, context?: Record<string, unknown>) {
        if (this.isProduction) {
            // Here you would integrate with your production logging service
            // Like Application Insights, Sentry, etc.
        } else {
            console.error(message, { error, context });
        }
    }

    warn(message: string, context?: Record<string, unknown>) {
        if (!this.isProduction) {
            console.warn(message, context);
        }
    }

    info(message: string, context?: Record<string, unknown>) {
        if (!this.isProduction) {
            console.info(message, context);
        }
    }

    debug(message: string, context?: Record<string, unknown>) {
        if (!this.isProduction) {
            console.debug(message, context);
        }
    }
}