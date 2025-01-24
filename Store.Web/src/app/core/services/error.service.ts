import { Injectable, signal, computed } from '@angular/core';
import { ApiError } from '../models/error.model';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly errors = signal<ApiError[]>([]);

  readonly currentErrors = computed(() => this.errors());
  readonly hasErrors = computed(() => this.errors().length > 0);

  addError(error: ApiError) {
    this.errors.update(errors => [...errors, error]);

    // Automatically remove error after 5 seconds
    setTimeout(() => {
      this.removeError(error);
    }, 5000);
  }

  removeError(error: ApiError) {
    this.errors.update(errors =>
      errors.filter(e => e !== error)
    );
  }

  clearErrors() {
    this.errors.set([]);
  }
}

