// src/app/core/services/base.service.ts
import { inject } from '@angular/core';
import { ErrorService } from './error.service';
import { LoggerService } from './logger.service';

export abstract class BaseService {
    protected readonly errorService = inject(ErrorService);
    protected readonly logger = inject(LoggerService);

    protected handleServiceError(message: string, error: unknown, context?: string): void {
        this.logger.error(message, { error, context });

        this.errorService.addError(
            context ? `${context.toUpperCase()}_ERROR` : 'SERVICE_ERROR',
            message,
            { severity: 'error', context: { error } }
        );
    }

    protected handleHttpError(message: string, error: unknown, context?: string): void {
        // Log the error
        this.logger.error(message, { error, context });

        // Display user-friendly error
        this.errorService.addError(
            context ? `${context.toUpperCase()}_ERROR` : 'HTTP_ERROR',
            message,
            { severity: 'error', context: { error } }
        );
    }
}