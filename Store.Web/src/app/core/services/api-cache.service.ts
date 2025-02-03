// src/app/core/services/api-cache.service.ts
import { Injectable } from '@angular/core';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class ApiCacheService {
    private cache = new Map<string, CacheEntry<unknown>>();

    // Default cache duration (5 minutes)
    private readonly DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

    set<T>(key: string, data: T, duration = this.DEFAULT_CACHE_DURATION): void {
        const timestamp = Date.now();
        this.cache.set(key, {
            data,
            timestamp,
            expiresAt: timestamp + duration
        });

        // Schedule cleanup
        setTimeout(() => {
            this.cache.delete(key);
        }, duration);
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T>;

        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    clear(): void {
        this.cache.clear();
    }

    remove(key: string): void {
        this.cache.delete(key);
    }
}