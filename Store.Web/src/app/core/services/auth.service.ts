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
        // Set up auth state management
        this.auth0.isAuthenticated$.pipe(
            takeUntilDestroyed()
        ).subscribe(isAuthenticated => {
            this.state.update(s => ({ ...s, isAuthenticated }));
        });

        this.auth0.user$.pipe(
            takeUntilDestroyed()
        ).subscribe(user => {
            if (user) {
                const userProfile: UserProfile = {
                    sub: user.sub ?? '',
                    email: user.email ?? '',
                    name: user.name ?? '',
                    picture: user.picture ?? '',
                    roles: user[`${environment.auth0.audience}/roles`] as string[] || []
                };
                this.state.update(s => ({ ...s, user: userProfile }));
            } else {
                this.state.update(s => ({ ...s, user: null }));
            }
        });

        // Initialize customer service
        this.customerService.setAuthService(this);
    }

    isAuthenticated(): Promise<boolean> {
        return firstValueFrom(this.isAuthenticated$);
    }

    async login(returnUrl?: string) {
        try {
            if (returnUrl) {
                localStorage.setItem('returnUrl', returnUrl);
            }
            await this.auth0.loginWithRedirect({
                appState: { returnTo: returnUrl }
            });
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

    handleAuthCallback() {
        return this.auth0.handleRedirectCallback().pipe(
            catchError(error => {
                this.authErrorService.handleError(error);
                this.router.navigate(['/']);
                return throwError(() => error);
            })
        ).subscribe();
    }
}