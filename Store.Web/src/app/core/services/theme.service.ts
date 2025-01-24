// src/app/core/services/theme.service.ts
import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly theme = signal<Theme>(this.getInitialTheme());
    private readonly prefersDark = signal<boolean>(this.getSystemPreference());

    readonly currentTheme = computed(() => {
        if (this.theme() === 'system') {
            return this.prefersDark() ? 'dark' : 'light';
        }
        return this.theme();
    });

    constructor() {
        // Watch for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            this.prefersDark.set(e.matches);
        });

        // Apply theme changes
        effect(() => {
            const theme = this.currentTheme();
            if (theme !== 'system') {
                this.applyTheme(theme);
            }
        });
    }

    private getInitialTheme(): Theme {
        const savedTheme = localStorage.getItem('theme') as Theme;
        return savedTheme || 'system';
    }

    private getSystemPreference(): boolean {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    private applyTheme(theme: 'light' | 'dark'): void {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', this.theme());
    }

    setTheme(newTheme: Theme): void {
        this.theme.set(newTheme);
    }

    toggleTheme(): void {
        const current = this.currentTheme();
        this.setTheme(current === 'light' ? 'dark' : 'light');
    }
}