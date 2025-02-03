// src/app/core/interceptors/api-error.interceptor.ts
import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from '../services/error.service';
import { environment } from '../../../environments/environment';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const errorService = inject(ErrorService);

    return next(req).pipe(
        catchError(error => {
            if (!error.status) {
                errorService.addError(
                    'NETWORK_ERROR',
                    'Unable to connect to the server. Please check your internet connection.',
                    {
                        severity: 'error',
                        context: { url: req.url }
                    }
                );
                return throwError(() => error);
            }

            switch (error.status) {
                case HttpStatusCode.Unauthorized:
                    errorService.addError(
                        'UNAUTHORIZED',
                        'Your session has expired. Please sign in again.',
                        { severity: 'warning' }
                    );
                    break;

                case HttpStatusCode.Forbidden:
                    errorService.addError(
                        'FORBIDDEN',
                        'You don\'t have permission to perform this action.',
                        { severity: 'error' }
                    );
                    break;

                case HttpStatusCode.NotFound:
                    errorService.addError(
                        'NOT_FOUND',
                        'The requested resource was not found.',
                        {
                            severity: 'error',
                            context: { url: req.url }
                        }
                    );
                    break;

                case HttpStatusCode.UnprocessableEntity:
                    const validationErrors = error.error?.errors;
                    if (validationErrors) {
                        errorService.addError(
                            'VALIDATION_ERROR',
                            'Please check your input and try again.',
                            {
                                severity: 'warning',
                                context: { validationErrors }
                            }
                        );
                    }
                    break;

                case HttpStatusCode.TooManyRequests:
                    errorService.addError(
                        'RATE_LIMITED',
                        'Please slow down and try again in a moment.',
                        { severity: 'warning' }
                    );
                    break;

                case HttpStatusCode.InternalServerError:
                    errorService.addError(
                        'SERVER_ERROR',
                        environment.production
                            ? 'An unexpected error occurred. Please try again later.'
                            : `Server error: ${error.message}`,
                        {
                            severity: 'error',
                            context: {
                                url: req.url,
                                error: environment.production ? undefined : error
                            }
                        }
                    );
                    break;

                default:
                    errorService.addError(
                        'UNKNOWN_ERROR',
                        'An unexpected error occurred. Please try again.',
                        {
                            severity: 'error',
                            context: {
                                status: error.status,
                                url: req.url
                            }
                        }
                    );
            }

            return throwError(() => error);
        })
    );
};