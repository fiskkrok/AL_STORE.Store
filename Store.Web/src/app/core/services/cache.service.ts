// src/app/core/services/cache.service.ts
import { Injectable, inject } from '@angular/core';
import { LoggerService } from './logger.service';
import { BaseService } from './base.service';

export interface CacheEntry<T> {
    data: T;
    expiry: number;
    insertedAt: number;
    key: string;
}

export interface CacheOptions {
    /**
     * Time to live in milliseconds
     */
    ttl?: number;

    /**
     * Tag to associate with this cache entry for group invalidation
     */
    tags?: string[];

    /**
     * Whether to skip checking browser storage (memory-only caching)
     */
    memoryOnly?: boolean;
}

export type InvalidationStrategy = 'all' | 'tag' | 'prefix' | 'key';

@Injectable({ providedIn: 'root' })
export class CacheService extends BaseService {
    private readonly logger = inject(LoggerService);

    // Memory cache
    private cache = new Map<string, CacheEntry<unknown>>();

    // Tag-based indexing for fast invalidation
    private tagIndex = new Map<string, Set<string>>();

    // Default TTL is 5 minutes
    private readonly DEFAULT_TTL = 5 * 60 * 1000;

    // Maximum entries to store in memory cache
    private readonly MAX_MEMORY_ENTRIES = 200;

    // Time-based auto clean interval (10 minutes)
    private readonly CLEANUP_INTERVAL = 10 * 60 * 1000;

    constructor() {
        super();
        this.setupAutoCleanup();
    }

    /**
     * Set up automatic cache cleanup at regular intervals
     */
    private setupAutoCleanup(): void {
        setInterval(() => this.cleanupExpiredEntries(), this.CLEANUP_INTERVAL);
    }

    /**
     * Set a value in the cache
     */
    set<T>(key: string, data: T, options: CacheOptions = {}): void {
        const ttl = options.ttl ?? this.DEFAULT_TTL;
        const now = Date.now();

        // Create cache entry
        const entry: CacheEntry<T> = {
            data,
            expiry: now + ttl,
            insertedAt: now,
            key
        };

        // Store in memory cache
        this.cache.set(key, entry as CacheEntry<unknown>);

        // Index by tags if provided
        if (options.tags && options.tags.length > 0) {
            for (const tag of options.tags) {
                if (!this.tagIndex.has(tag)) {
                    this.tagIndex.set(tag, new Set<string>());
                }
                this.tagIndex.get(tag)!.add(key);
            }
        }

        // Store in browser storage if not memory-only
        if (!options.memoryOnly) {
            try {
                localStorage.setItem(`cache_${key}`, JSON.stringify({
                    data,
                    expiry: entry.expiry,
                    insertedAt: entry.insertedAt
                }));
            } catch (e) {
                this.logger.warn('Failed to store cache entry in localStorage', { key, error: e });
            }
        }

        // Enforce cache size limits
        this.enforceMemoryCacheLimit();
    }

    /**
     * Get a value from the cache
     */
    get<T>(key: string): T | null {
        // Try memory cache first
        const memoryEntry = this.cache.get(key) as CacheEntry<T> | undefined;

        if (memoryEntry) {
            // Check if expired
            if (Date.now() > memoryEntry.expiry) {
                this.remove(key);
                return null;
            }

            return memoryEntry.data;
        }

        // Try browser storage
        try {
            const storageItem = localStorage.getItem(`cache_${key}`);

            if (storageItem) {
                const parsedItem = JSON.parse(storageItem);

                // Check if expired
                if (Date.now() > parsedItem.expiry) {
                    this.remove(key);
                    return null;
                }

                // Restore to memory cache
                this.cache.set(key, {
                    data: parsedItem.data,
                    expiry: parsedItem.expiry,
                    insertedAt: parsedItem.insertedAt,
                    key
                });

                return parsedItem.data as T;
            }
        } catch (e) {
            this.logger.error('Failed to retrieve cache entry from localStorage', { key, error: e });
        }

        return null;
    }

    /**
     * Check if a key exists in the cache and is not expired
     */
    has(key: string): boolean {
        const memoryEntry = this.cache.get(key);

        if (memoryEntry) {
            // Check if expired
            if (Date.now() > memoryEntry.expiry) {
                this.remove(key);
                return false;
            }
            return true;
        }

        // Check browser storage
        try {
            const storageItem = localStorage.getItem(`cache_${key}`);

            if (storageItem) {
                const parsedItem = JSON.parse(storageItem);

                // Check if expired
                if (Date.now() > parsedItem.expiry) {
                    this.remove(key);
                    return false;
                }
                return true;
            }
        } catch (e) {
            // Ignore errors, just return false
        }

        return false;
    }

    /**
     * Remove a specific item from the cache
     */
    remove(key: string): void {
        // Remove from memory cache
        this.cache.delete(key);

        // Remove from tag index
        for (const [tag, keys] of this.tagIndex.entries()) {
            if (keys.has(key)) {
                keys.delete(key);

                // Clean up empty tag sets
                if (keys.size === 0) {
                    this.tagIndex.delete(tag);
                }
            }
        }

        // Remove from browser storage
        try {
            localStorage.removeItem(`cache_${key}`);
        } catch (e) {
            // Ignore errors
        }
    }

    /**
     * Clear the entire cache
     */
    clear(): void {
        // Clear memory cache
        this.cache.clear();
        this.tagIndex.clear();

        // Clear browser storage cache entries
        try {
            const keysToRemove: string[] = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('cache_')) {
                    keysToRemove.push(key);
                }
            }

            for (const key of keysToRemove) {
                localStorage.removeItem(key);
            }
        } catch (e) {
            this.logger.error('Failed to clear cache from localStorage', { error: e });
        }
    }

    /**
     * Invalidate cache entries based on different strategies
     */
    invalidate(strategy: InvalidationStrategy, reference: string): void {
        switch (strategy) {
            case 'all':
                this.clear();
                break;

            case 'tag':
                this.invalidateByTag(reference);
                break;

            case 'prefix':
                this.invalidateByPrefix(reference);
                break;

            case 'key':
                this.remove(reference);
                break;
        }
    }

    /**
     * Invalidate all cache entries with a specific tag
     */
    private invalidateByTag(tag: string): void {
        const keys = this.tagIndex.get(tag);

        if (keys) {
            // Create a copy of the keys to avoid modification during iteration
            [...keys].forEach(key => this.remove(key));

            // Remove the tag index
            this.tagIndex.delete(tag);
        }
    }

    /**
     * Invalidate all cache entries whose keys start with a specific prefix
     */
    private invalidateByPrefix(prefix: string): void {
        // Find all matching keys in memory cache
        const keysToRemove: string[] = [];

        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }

        // Remove all matching keys
        keysToRemove.forEach(key => this.remove(key));

        // Also remove from browser storage
        try {
            const storageKeysToRemove: string[] = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('cache_' + prefix)) {
                    storageKeysToRemove.push(key);
                }
            }

            for (const key of storageKeysToRemove) {
                localStorage.removeItem(key);
            }
        } catch (e) {
            this.logger.error('Failed to invalidate prefix from localStorage', { prefix, error: e });
        }
    }

    /**
     * Clean up expired entries from the cache
     */
    private cleanupExpiredEntries(): void {
        const now = Date.now();
        const expiredKeys: string[] = [];

        // Find expired entries in memory cache
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                expiredKeys.push(key);
            }
        }

        // Remove expired entries
        expiredKeys.forEach(key => this.remove(key));

        this.logger.debug(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
    }

    /**
     * Enforce the memory cache size limit
     */
    private enforceMemoryCacheLimit(): void {
        if (this.cache.size <= this.MAX_MEMORY_ENTRIES) {
            return;
        }

        // If we've exceeded the limit, remove oldest entries first
        const entries = Array.from(this.cache.values())
            .sort((a, b) => a.insertedAt - b.insertedAt);

        const entriesToRemove = entries.slice(0, entries.length - this.MAX_MEMORY_ENTRIES);

        entriesToRemove.forEach(entry => this.remove(entry.key));

        this.logger.debug(`Cache limit enforcement: removed ${entriesToRemove.length} oldest entries`);
    }
}