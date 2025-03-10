// src/app/core/services/error-handler.service.ts
// imports

import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ApiError } from "../../shared/models";
import { ErrorService } from "./error.service";
import { LoggerService } from "./logger.service";
import { PaymentError } from "./payment-recovery.service";

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
    private readonly errorService = inject(ErrorService);
    private readonly logger = inject(LoggerService);
    private readonly router = inject(Router);

    /**
     * Handle HTTP errors with standardized approach
     */
    handleHttpError(error: HttpErrorResponse, context?: string): void {
        // Log the error
        this.logger.error(`HTTP Error${context ? ` in ${context}` : ''}`, error);

        if (error.status === 401) {
            this.handleAuthError();
            return;
        }

        if (error.status === 404) {
            this.errorService.addError(
                'NOT_FOUND',
                'The requested resource was not found',
                { severity: 'warning' }
            );
            return;
        }

        if (error.status === 400 || error.status === 422) {
            this.handleValidationError(error);
            return;
        }

        // Generic error handler for other statuses
        this.errorService.addError(
            `HTTP_ERROR_${error.status || 'UNKNOWN'}`,
            this.getErrorMessage(error),
            { severity: 'error' }
        );
    }

    /**
     * Handle authentication errors
     */
    handleAuthError(): void {
        // Clear sensitive state that requires authentication
        // (implement your state clearing logic here)

        this.errorService.addError(
            'AUTH_ERROR',
            'Your session has expired. Please sign in again.',
            {
                severity: 'warning',
                context: { returnUrl: this.router.url }
            }
        );

        // Redirect to login
        this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url }
        });
    }

    /**
     * Handle validation errors
     */
    private handleValidationError(error: HttpErrorResponse): void {
        if (error.error && typeof error.error === 'object' && 'details' in error.error) {
            const apiError = error.error as ApiError;

            if (apiError.details && 'errors' in apiError.details) {
                const errorDetails = apiError.details as { errors: Record<string, string[]> };
                const messages = Object.entries(errorDetails.errors)
                    .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(', ')}`)
                    .join('\n');

                this.errorService.addError(
                    'VALIDATION_ERROR',
                    'Please correct the following errors:',
                    {
                        severity: 'warning',
                        context: { validationErrors: errorDetails.errors }
                    }
                );
                return;
            }
        }

        // Fallback for validation errors without structured details
        this.errorService.addError(
            'VALIDATION_ERROR',
            'Please check your input and try again',
            { severity: 'warning' }
        );
    }

    /**
     * Format error message from HTTP response
     */
    private getErrorMessage(error: HttpErrorResponse): string {
        if (error.error instanceof ErrorEvent) {
            // Client-side error
            return error.error.message;
        }

        // Server error with message
        if (error.error && typeof error.error === 'object' && 'message' in error.error) {
            return error.error.message as string;
        }

        // Fallback error message
        return error.message || `Error ${error.status}: ${error.statusText}`;
    }

    /**
     * Handle payment-specific errors
     */
    handlePaymentError(error: any): void {
        if (error && typeof error === 'object' && 'code' in error) {
            // Handle structured payment errors
            const paymentError = error as PaymentError;
            const errorMessage = paymentError.message || 'Payment processing failed';

            this.errorService.addError(
                `PAYMENT_ERROR_${paymentError.code}`,
                errorMessage,
                {
                    severity: 'error',
                    context: { originalError: error }
                }
            );
        } else {
            // Generic error
            this.errorService.addError(
                'PAYMENT_ERROR',
                error instanceof Error ? error.message : 'An error occurred during payment processing',
                { severity: 'error' }
            );
        }
    }
}