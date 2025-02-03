// src/app/core/services/auth-error.service.ts
import { Injectable, inject } from '@angular/core';
import { ErrorService } from './error.service';
import { Router } from '@angular/router';

export interface Auth0Error {
    error: string;
    error_description: string;
    state?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthErrorService {
    private errorService = inject(ErrorService);
    private router = inject(Router);

    handleError(error: Auth0Error) {
        switch (error.error) {
            case 'login_required':
                this.errorService.addError(
                    'AUTH_LOGIN_REQUIRED',
                    'Please sign in to continue.',
                    { severity: 'warning' }
                );
                this.router.navigate(['/']);
                break;

            case 'consent_required':
                this.errorService.addError(
                    'AUTH_CONSENT_REQUIRED',
                    'Application permissions need to be updated.',
                    { severity: 'warning' }
                );
                break;

            case 'invalid_grant':
                this.errorService.addError(
                    'AUTH_INVALID_GRANT',
                    'Your session has expired. Please sign in again.',
                    { severity: 'warning' }
                );
                break;

            case 'unauthorized':
                this.errorService.addError(
                    'AUTH_UNAUTHORIZED',
                    'You are not authorized to perform this action.',
                    { severity: 'error' }
                );
                break;

            default:
                this.errorService.addError(
                    'AUTH_ERROR',
                    'An authentication error occurred. Please try again.',
                    {
                        severity: 'error',
                        context: { originalError: error }
                    }
                );
        }
    }
}