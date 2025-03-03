// src/app/core/services/error.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { LoggerService } from './logger.service';
import { AppError, ErrorOptions } from '../../shared/models/error.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly logger = inject(LoggerService);
  private readonly errors = signal<AppError[]>([]);

  readonly currentErrors = computed(() => this.errors());
  readonly hasErrors = computed(() => this.errors().length > 0);
  readonly criticalErrors = computed(() =>
    this.errors().filter(e => e.severity === 'fatal')
  );

  addError(
    code: string,
    message: string,
    options: ErrorOptions = {}
  ) {
    const error: AppError = {
      code,
      message,
      severity: options.severity ?? 'error',
      timestamp: new Date(),
      context: options.context
    };

    this.logger.error(message, error, options.context);
    this.errors.update(errors => [...errors, error]);

    if (options.timeout !== 0) {
      setTimeout(() => this.removeError(error), options.timeout ?? 5000);
    }

    // Handle fatal errors differently
    if (error.severity === 'fatal') {
      if (!environment.production) {
        console.log('Fatal error detected:', error);
        return;
      }
      this.handleFatalError(error);
    }
  }

  private handleFatalError(error: AppError) {
    // Implement fatal error handling
    this.logger.error('Fatal error encountered. Initiating full recovery.', error);
    // Lazy load the full-screen error component using dynamic import (assuming a lazy-loaded fatal error UI)
    import('../components/fatal-error.component')
      .then(() => {
        // Here, you can display the full-screen error component if desired.
        // For example, using a component outlet or service to show the component.
        // After showing the error, force a refresh to attempt recovery.
        setTimeout(() => location.reload(), 3000);
      })
      .catch((err: unknown) => {
        // If lazy loading fails, attempt a fallback refresh.
        this.logger.error('Failed to load fatal error component.', err);
        setTimeout(() => location.reload(), 3000);
      });
  }

  removeError(error: AppError) {
    this.errors.update(errors =>
      errors.filter(e => e !== error)
    );
  }

  clearErrors() {
    this.errors.set([]);
  }
}