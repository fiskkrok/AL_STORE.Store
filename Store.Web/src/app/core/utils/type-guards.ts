// src/app/core/utils/type-guards.ts

import { ApiError } from "../../shared/models";
import { Auth0Error } from "../services/auth-error.service";

export const isApiError = (error: unknown): error is ApiError => {
    return typeof error === 'object' && error !== null && 'code' in error;
};

// export const isAppError = (error: unknown): error is AppError => {
//     return typeof error === 'object' &&
//         error !== null &&
//         'code' in error &&
//         'severity' in error;
// };

export const isAuth0Error = (error: unknown): error is Auth0Error => {
    return typeof error === 'object' &&
        error !== null &&
        'error' in error &&
        'error_description' in error;
};