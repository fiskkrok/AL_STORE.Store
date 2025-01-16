export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}