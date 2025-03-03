// src/app/core/models/error.model.ts
export interface ApiError {
    code: string;
    message: string;
    details?: {
        errors?: Record<string, string[]>;
    };
}

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'fatal';

export interface AppError {
    code: string;
    message: string;
    severity: ErrorSeverity;
    timestamp: Date;
    context?: Record<string, unknown>;
    originalError?: unknown;
}

export interface ErrorOptions {
    severity?: ErrorSeverity;
    context?: Record<string, unknown>;
    timeout?: number;
}