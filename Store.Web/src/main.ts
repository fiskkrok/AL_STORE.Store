import { bootstrapApplication } from '@angular/platform-browser';
import { provideAuth0 } from '@auth0/auth0-angular';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    provideAuth0({
      domain: 'dev-3on2otf3kmyxv53z.us.auth0.com',
      clientId: 'hwsquizkgecZPiyytTWSdGkhbjt0AeS4',
      authorizationParams: {
        redirect_uri: `${window.location.origin}/auth/callback`
      }
    }),
  ]
});