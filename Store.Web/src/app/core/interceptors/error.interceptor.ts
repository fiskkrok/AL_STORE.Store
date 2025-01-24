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
            errorService.addError({
              code: 'UNAUTHORIZED',
              message: 'Please log in to continue'
            });
            router.navigate(['/login']);
            break;

          case 403:
            errorService.addError({
              code: 'FORBIDDEN',
              message: 'You don\'t have permission to access this resource'
            });
            break;

          case 404:
            errorService.addError({
              code: 'NOT_FOUND',
              message: 'The requested resource was not found'
            });
            break;

          case 422: {
            const validationErrors = error.error.errors;
            if (validationErrors) {
              errorService.addError({
                code: 'VALIDATION_ERROR',
                message: 'Please check your input',
                details: validationErrors
              });
            }
            break;
          }

          default:
            errorService.addError({
              code: 'UNEXPECTED_ERROR',
              message: 'An unexpected error occurred. Please try again later.'
            });
        }
      }
      return throwError(() => error);
    })
  );
};
