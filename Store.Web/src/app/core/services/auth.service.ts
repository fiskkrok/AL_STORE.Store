/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { ErrorService } from './error.service';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UserProfile } from '../models/auth.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly auth0 = inject(Auth0Service);
    private readonly router = inject(Router);
    private readonly errorService = inject(ErrorService);

    readonly isAuthenticated$ = this.auth0.isAuthenticated$;
    readonly user$ = this.auth0.user$;
    private state = signal<{
        isLoading: boolean;
        isAuthenticated: boolean;
        user: UserProfile | null;
        error: string | null;
    }>({
        isLoading: true,
        isAuthenticated: false,
        user: null,
        error: null
    });
    // Exposed states
    readonly isLoading = computed(() => this.state().isLoading);
    readonly user = computed(() => this.state().user);
    readonly error = computed(() => this.state().error);
    // Computed permissions
    readonly isAdmin = computed(() =>
        this.state().user?.roles?.includes('admin') ?? false
    );
    constructor() {
        // Subscribe to auth state changes
        this.auth0.isLoading$.pipe(
            takeUntilDestroyed()
        ).subscribe(isLoading => {
            this.state.update(s => ({ ...s, isLoading }));
        });

        this.auth0.isAuthenticated$.pipe(
            takeUntilDestroyed()
        ).subscribe(isAuthenticated => {
            this.state.update(s => ({ ...s, isAuthenticated }));
        });

        this.auth0.user$.pipe(
            takeUntilDestroyed()
        ).subscribe(user => {
            this.state.update(s => ({
                ...s,
                user: user ? {
                    sub: user.sub ?? '',
                    email: user.email ?? '',
                    name: user.name ?? '',
                    picture: user.picture ?? '',
                    roles: user[`${environment.auth0.audience}/roles`] as string[] || []
                } : null
            }));
        });

        this.auth0.error$.pipe(
            takeUntilDestroyed()
        ).subscribe(error => {
            this.state.update(s => ({ ...s, error: error?.message ?? null }));
        });
    }
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