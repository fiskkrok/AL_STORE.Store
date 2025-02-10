import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ErrorService } from '../services/error.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 401:
            errorService.addError(
              'UNAUTHORIZED',
              'Please log in to continue'
            );
            router.navigate(['/login']);
            break;

          case 403:
            errorService.addError(
              'FORBIDDEN',
              'You don\'t have permission to access this resource'
            );
            break;

          case 404:
            errorService.addError(
              'NOT_FOUND',
              'The requested resource was not found'
            );
            break;

          case 422: {
            const validationErrors = error.error.errors;
            if (validationErrors) {
              errorService.addError(
                'VALIDATION_ERROR',
                'Please check your input',
                validationErrors
              );
            }
            break;
          }

          default:
            errorService.addError(
              'UNEXPECTED_ERROR',
              'An unexpected error occurred. Please try again later.'
            );
        }
      }
      return throwError(() => error);
    })
  );
};
