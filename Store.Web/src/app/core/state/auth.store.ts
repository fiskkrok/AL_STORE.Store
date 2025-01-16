import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { User } from '@auth0/auth0-spa-js';

@Injectable({ providedIn: 'root' })
export class AuthStore {
    updateProfile(value: Partial<{ name: string | null; email: string | null; phone: string | null; }>) {
        throw new Error('Method not implemented.');
    }
    deleteAccount() {
        throw new Error('Method not implemented.');
    }
    private readonly user = signal<User | null>(null);
    private readonly isLoading = signal(true);

    readonly isAuthenticated = computed(() => !!this.user());
    readonly userProfile = computed(() => this.user());
    readonly loading = computed(() => this.isLoading());

    constructor(
        private auth0: Auth0Service,
        private router: Router
    ) {
        // Subscribe to Auth0 user changes
        this.auth0.user$.subscribe(user => {
            this.user.set(user ?? null);
            this.isLoading.set(false);
        });
    }

    async login(): Promise<void> {
        await this.auth0.loginWithRedirect({
            appState: { target: this.router.url }
        });
    }

    async logout(): Promise<void> {
        await this.auth0.logout();
    }
}