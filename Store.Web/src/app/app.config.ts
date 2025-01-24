import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuth0 } from '@auth0/auth0-angular';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAuth0({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        scope: 'openid profile email offline_access'
      },
      useRefreshTokens: true,
      cacheLocation: 'localstorage',
      skipRedirectCallback: false,
      errorPath: '/error',
      httpInterceptor: {
        allowedList: [
          {
            uri: `${environment.apiUrl}/*`,
            // tokenOptions: {
            //   audience: environment.auth0.audience
            // }
          }
        ]
      },
      // debug: isDevMode() // Enable debug logs in development
    })
  ]
};