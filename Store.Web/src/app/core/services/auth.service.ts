// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth0: Auth0Service) { }

  getToken(): Promise<string> {
    return this.auth0.getAccessTokenSilently().toPromise().then(token => {
      if (!token) {
        throw new Error('Access token is undefined');
      }
      return token;
    });
  }

  isAuthenticated(): boolean {
    let isAuthenticated = false;
    this.auth0.isAuthenticated$.subscribe(value => isAuthenticated = value);
    return isAuthenticated;
  }
}