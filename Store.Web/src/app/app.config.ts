// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authHttpInterceptorFn])
    ),
    provideAuth0({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        scope: 'openid profile email offline_access',
        audience: environment.auth0.audience // Uncomment if needed
      },
      useRefreshTokens: true,
      cacheLocation: 'localstorage',
      skipRedirectCallback: false,
      errorPath: '/error',
      httpInterceptor: {
        allowedList: [
          {
            uri: `${environment.apiUrl}/api/admin/*`,
            tokenOptions: {
              // audience: environment.auth0.audience
            }
          },
          {
            uri: `${environment.apiUrl}/api/store/*`
          }
        ]
      },
    })
  ]
};