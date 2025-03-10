// src/app/core/services/script-loader.service.ts
import { Injectable, signal } from '@angular/core';
import { LoggerService } from './logger.service';

interface ScriptConfig {
    url: string;
    attributes?: Record<string, string>;
    loadCheck?: () => boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ScriptLoaderService {
    private readonly loadedScripts = new Map<string, boolean>();

    constructor(private readonly logger: LoggerService) { }

    /**
     * Load an external script
     * @param config Script configuration
     * @returns Promise that resolves when the script is loaded
     */
    loadScript(config: ScriptConfig): Promise<void> {
        const { url, attributes = {}, loadCheck } = config;

        // If we've already loaded this script
        if (this.loadedScripts.get(url)) {
            return Promise.resolve();
        }

        // If there's a custom check to see if the script is already loaded
        if (loadCheck && loadCheck()) {
            this.loadedScripts.set(url, true);
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;

            // Add any custom attributes
            Object.entries(attributes).forEach(([attr, value]) => {
                script.setAttribute(attr, value);
            });

            script.onload = () => {
                this.loadedScripts.set(url, true);
                this.logger.info(`Script loaded: ${url}`);
                resolve();
            };

            script.onerror = (error) => {
                this.logger.error(`Failed to load script: ${url}`, error);
                reject(new Error(`Failed to load script: ${url}`));
            };

            document.body.appendChild(script);
        });
    }

    /**
     * Check if a script has been loaded
     */
    isScriptLoaded(url: string): boolean {
        return !!this.loadedScripts.get(url);
    }
}