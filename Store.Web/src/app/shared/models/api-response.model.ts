// src/app/shared/models/api-response.model.ts

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    error?: ApiError;
    metadata?: {
        timestamp: string;
        requestId: string;
        page?: number;
        pageSize?: number;
        totalCount?: number;
    };
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
    metadata: {
        timestamp: string;
        requestId: string;
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
}