// src/app/core/services/script-loader.service.ts
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

interface ScriptConfig {
    url: string;
    attributes?: Record<string, string>;
    loadCheck?: () => boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ScriptLoaderService extends BaseService {
    private readonly loadedScripts = new Map<string, boolean>();

    /**
     * Load an external script
     * @param config Script configuration
     * @returns Promise that resolves when the script is loaded
     */
    loadScript(config: ScriptConfig): Promise<void> {
        const { url, attributes = {}, loadCheck } = config;

        // If we've already loaded this script
        if (this.loadedScripts.get(url)) {
            this.logger.debug(`Script already loaded: ${url}`);
            return Promise.resolve();
        }

        // If there's a custom check to see if the script is already loaded
        if (loadCheck && loadCheck()) {
            this.loadedScripts.set(url, true);
            this.logger.debug(`Script detected as pre-loaded: ${url}`);
            return Promise.resolve();
        }

        this.logger.info(`Loading script: ${url}`);

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
                this.logger.info(`Script loaded successfully: ${url}`);
                resolve();
            };

            script.onerror = (error) => {
                this.handleServiceError(`Failed to load script: ${url}`, error, 'script-loader');
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