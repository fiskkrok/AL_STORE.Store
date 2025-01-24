// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const auth = inject(AuthService);

    const isAuthenticated = await auth.isAuthenticated();

    if (!isAuthenticated) {
        // Save attempted URL and redirect to login
        await auth.login(state.url);
        return false;
    }

    return true;
};