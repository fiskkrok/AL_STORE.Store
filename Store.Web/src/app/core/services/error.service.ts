// src/app/core/services/error.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { LoggerService } from './logger.service';
import { AppError, ErrorOptions } from '../models/error.model';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private logger = inject(LoggerService);
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
      this.handleFatalError(error);
    }
  }

  private handleFatalError(error: AppError) {
    // Implement fatal error handling
    // Could show a full-screen error message
    // Could attempt to recover the application
    // Could force a refresh
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