// src/environments/environment.ts
export const environment = {
  production: false,
  useRealApi: false, // Toggle between mock and real API
  apiUrl: 'https://localhost:5001',
  auth0: {
    domain: 'your-auth0-domain',
    clientId: 'your-auth0-clientId',
    audience: 'your-auth0-audience'
  }
} as const;