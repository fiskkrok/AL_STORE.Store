import { Injectable, inject, signal } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { catchError, throwError, firstValueFrom } from 'rxjs';

import { Auth0Error, AuthErrorService } from './auth-error.service';
import { ErrorService } from './error.service';
import { UserProfile } from '../../shared/models/auth.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { CustomerService } from './customer.service';
import { UserService } from './user.service';
import { CreateProfileRequest } from '../../shared/models/customer.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly auth0 = inject(Auth0Service);
    private readonly router = inject(Router);
    private readonly authErrorService = inject(AuthErrorService);
    private readonly errorService = inject(ErrorService);
    private readonly customerService = inject(CustomerService);
    private readonly userService = inject(UserService);
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
                    roles: user[`${environment.auth0.audience}/roles`] as string[] ?? []
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

    // auth.service.ts
    async login(returnUrl?: string) {
        try {
            if (returnUrl) {
                localStorage.setItem('returnUrl', returnUrl);
            }
            await this.auth0.loginWithRedirect({
                appState: { returnTo: returnUrl }
            });
        } catch (error) {
            console.error('Login error:', error);
            this.errorService.addError(
                'AUTH_ERROR',
                'Failed to initiate login'
            );
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
            catchError((error: unknown) => {
                this.authErrorService.handleError(error as Auth0Error);
                this.router.navigate(['/']);
                return throwError(() => error);
            })
        ).subscribe(async () => {
            // This code doesnt work and might be subject for removal
            try {

                const profileExists = await this.customerService.checkProfileExists();

                // Check if profile exists

                if (!profileExists) {
                    const userInfo = await firstValueFrom(this.userService.getUserInfo());
                    // Create profile if it doesn't exist
                    const createProfileRequest: CreateProfileRequest = {
                        firstName: userInfo.given_name,
                        lastName: userInfo.family_name,
                        email: userInfo.email,
                        auth0Id: userInfo.sub,
                        // ... map other relevant userinfo fields to your CreateProfileRequest
                    };
                    await this.customerService.createProfile(createProfileRequest);
                } else {

                    await this.customerService.loadProfile();
                }

                // Navigate to return URL
                const returnUrl = localStorage.getItem('returnUrl') ?? '/';
                localStorage.removeItem('returnUrl');
                this.router.navigateByUrl(returnUrl);

            } catch (error) {
                console.error('Error in handleAuthCallback:', error);
                this.router.navigate(['/']); // Handle errors gracefully, maybe show an error message
            }
        });
    }

}