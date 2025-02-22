// src/app/core/models/api.model.ts
import { ApiError } from './error.model';

export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
    meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    page: number;
    pageSize: number;
}