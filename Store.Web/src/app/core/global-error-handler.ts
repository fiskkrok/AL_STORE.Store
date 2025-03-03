// src/app/core/error-handling/global-error-handler.ts
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ErrorService } from './services/error.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private readonly errorService = inject(ErrorService);

    handleError(error: unknown) {
        this.errorService.addError(
            'UNCAUGHT_ERROR',
            this.extractMessage(error),
            {
                severity: 'fatal',
                context: { error },
                timeout: 0
            }
        );
    }

    private extractMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}