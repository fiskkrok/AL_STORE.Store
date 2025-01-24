// src/environments/environment.ts
export const environment = {
    production: false,
    useRealApi: false, // Toggle between mock and real API
    apiUrl: 'https://localhost:5001',
    auth0: {
        domain: 'your-tenant.eu.auth0.com', // You'll need to replace this with your Auth0 domain
        clientId: 'your-client-id', // You'll need to replace this with your Auth0 client ID
        audience: 'https://api.yourstore.com', // Optional: Your API identifier
        redirectUri: window.location.origin,
        scope: 'openid profile email'
    }
} as const;