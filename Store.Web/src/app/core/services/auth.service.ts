/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { ErrorService } from './error.service';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly auth0 = inject(Auth0Service);
    private readonly router = inject(Router);
    private readonly errorService = inject(ErrorService);

    readonly isAuthenticated$ = this.auth0.isAuthenticated$;
    readonly user$ = this.auth0.user$;

    async login(returnUrl?: string) {
        try {
            if (returnUrl) {
                localStorage.setItem('returnUrl', returnUrl);
            }
            await this.auth0.loginWithRedirect();
        } catch (error) {
            this.handleAuthError('login', error);
        }
    }

    async logout() {
        try {
            await this.auth0.logout({
                logoutParams: {
                    returnTo: window.location.origin
                }
            });
        } catch (error) {
            this.handleAuthError('logout', error);
        }
    }

    handleAuthCallback() {
        const returnUrl = localStorage.getItem('returnUrl');

        return this.isAuthenticated$.pipe(
            tap((isAuthenticated) => {
                if (isAuthenticated) {
                    const redirectTo = returnUrl || '/';
                    localStorage.removeItem('returnUrl');
                    this.router.navigate([redirectTo]);
                }
            }),
            catchError((error) => {
                this.handleAuthError('callback', error);
                this.router.navigate(['/']);
                return throwError(() => error);
            })
        );
    }

    isAuthenticated(): Promise<boolean> {
        return new Promise((resolve) => {
            this.isAuthenticated$.subscribe({
                next: resolve,
                error: (error) => {
                    this.handleAuthError('check', error);
                    resolve(false);
                }
            });
        });
    }

    private handleAuthError(operation: 'login' | 'logout' | 'callback' | 'check', error: any) {
        console.error(`Auth error during ${operation}:`, error);

        const errorMessages = {
            login: 'Unable to sign in. Please try again.',
            logout: 'Error signing out. Please try again.',
            callback: 'Error completing authentication. Please try signing in again.',
            check: 'Error checking authentication status.'
        };

        const message = errorMessages[operation];

        if (error.error_description === 'user is blocked') {
            this.errorService.addError({
                code: 'AUTH_BLOCKED',
                message: 'This account has been blocked. Please contact support.'
            });
        } else if (error.error === 'unauthorized') {
            this.errorService.addError({
                code: 'AUTH_UNAUTHORIZED',
                message: 'Your session has expired. Please sign in again.'
            });
        } else {
            this.errorService.addError({
                code: 'AUTH_ERROR',
                message,
                details: { operation, error }
            });
        }
    }
}