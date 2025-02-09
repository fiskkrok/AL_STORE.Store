import { Injectable, inject, signal } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { catchError, throwError, firstValueFrom } from 'rxjs';

import { Auth0Error, AuthErrorService } from './auth-error.service';
import { ErrorService } from './error.service';
import { UserProfile } from '../models/auth.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { CustomerService } from './customer.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly auth0 = inject(Auth0Service);
    private readonly router = inject(Router);
    private readonly authErrorService = inject(AuthErrorService);
    private readonly errorService = inject(ErrorService);
    private readonly customerService = inject(CustomerService);

    readonly isAuthenticated$ = this.auth0.isAuthenticated$;
    readonly user$ = this.auth0.user$;
    private readonly state = signal<{
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

    constructor() {
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

        this.customerService.setAuthService(this);
    }
    handleAuthCallback() {
        return this.auth0.handleRedirectCallback().pipe(
            catchError(error => {
                this.authErrorService.handleError(error);
                this.router.navigate(['/']);
                return throwError(() => error);
            })
        ).subscribe(async () => {
            const user = await firstValueFrom(this.auth0.user$);
            if (user) {
                try {
                    // Check if profile exists
                    await this.customerService.loadProfile();
                } catch (error) {
                    if (typeof error === 'object' && error !== null && 'status' in error && (error as { status?: number }).status === 404) {
                        // Profile does not exist, create a new profile
                        await this.customerService.createProfile({
                            firstName: user.given_name || '',
                            lastName: user.family_name || '',
                            email: user.email || '',
                            phone: user.phone_number || ''
                        });
                    } else {
                        throw error;
                    }
                }
            }
        });
    }

    async login(returnUrl?: string) {
        try {
            if (returnUrl) {
                localStorage.setItem('returnUrl', returnUrl);
            }
            await this.auth0.loginWithRedirect();
        } catch (error) {
            this.authErrorService.handleError(error as Auth0Error);
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
            this.authErrorService.handleError(error as Auth0Error);
        }
    }

    isAuthenticated(): Promise<boolean> {
        return new Promise((resolve) => {
            this.isAuthenticated$.subscribe({
                next: resolve,
                error: (error) => {
                    this.authErrorService.handleError(error);
                    resolve(false);
                }
            });
        });
    }
}