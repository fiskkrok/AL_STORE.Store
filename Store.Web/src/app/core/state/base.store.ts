import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class BaseStore {
    protected _loading = signal(false);
    protected _error = signal<string | null>(null);

    // Public getters
    public readonly loading = this._loading.asReadonly();
    public readonly error = this._error.asReadonly();

    protected setLoading(isLoading: boolean): void {
        this._loading.set(isLoading);
    }

    protected setError(error: string | null): void {
        this._error.set(error);
    }
}