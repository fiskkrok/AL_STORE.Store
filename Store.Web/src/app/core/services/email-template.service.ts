// src/app/core/services/email-template.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { LoggerService } from './logger.service';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class EmailTemplateService extends BaseService {
    private readonly http = inject(HttpClient);
    private readonly templateCache = new Map<string, string>();
    private readonly basePath = '/assets/email-templates';

    /**
     * Load an email template by name
     */
    getTemplate(templateName: string): Observable<string> {
        // Check cache first
        if (this.templateCache.has(templateName)) {
            return of(this.templateCache.get(templateName)!);
        }

        // Load template from file
        return this.http.get(
            `${this.basePath}/${templateName}.html`,
            { responseType: 'text' }
        ).pipe(
            map(template => {
                // Store in cache
                this.templateCache.set(templateName, template);
                return template;
            }),
            catchError(error => {
                this.handleServiceError(`Failed to load email template: ${templateName}`, error, 'email');
                // Return a basic fallback template
                return of(this.getFallbackTemplate());
            })
        );
    }

    /**
     * Render a template with provided data
     */
    renderTemplate(template: string, data: Record<string, any>): string {
        let rendered = template;

        // Replace all {{variable}} placeholders with actual data
        Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, String(value));
        });

        return rendered;
    }

    /**
     * Get and render a template in one operation
     */
    getRenderedTemplate(templateName: string, data: Record<string, any>): Observable<string> {
        return this.getTemplate(templateName).pipe(
            map(template => this.renderTemplate(template, data))
        );
    }

    /**
     * Basic fallback template if the requested one isn't found
     */
    private getFallbackTemplate(): string {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>{{subject}}</title>
        </head>
        <body>
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1A2238; padding: 20px; text-align: center; color: white;">
              <h1>{{subject}}</h1>
            </div>
            <div style="padding: 20px;">
              <p>{{message}}</p>
            </div>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
              <p>© 2025 AL Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
}