// src/app/app.config.ts
import { ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './core/error-handling/global-error-handler';
import { apiErrorInterceptor } from './core/interceptors/api-error.intercepter';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule } from '@ngx-formly/core';
import { formlyValidationConfig } from './shared/forms/formly/validation-types';

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authHttpInterceptorFn, apiErrorInterceptor])
    ),
    FormlyBootstrapModule,
    importProvidersFrom(
      FormlyModule.forRoot(
        formlyValidationConfig
      )
    ),
    provideAuth0({
      domain: 'dev-3on2otf3kmyxv53z.us.auth0.com',
      clientId: 'hwsquizkgecZPiyytTWSdGkhbjt0AeS4',
      authorizationParams: {
        redirect_uri: `${window.location.origin}/auth/callback`,
        audience: 'https://localhost:5001',
        scope: 'openid profile email read:profile offline_access'  // Add offline_access
      },
      // useRefreshTokens: true,  // Add this
      // cacheLocation: 'localstorage',  // Add this
      httpInterceptor: {
        allowedList: [
          {
            uri: 'https://localhost:5001/api/*',  // More specific URI
            allowAnonymous: false,  // Add this
            tokenOptions: {
              authorizationParams: {
                audience: 'https://localhost:5001'
              }
            }
          }
        ]
      }
    }),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ]
};