// src/environments/environment.ts
export const environment = {
  production: false,
  useRealApi: true, // Toggle between mock and real API
  apiUrl: 'https://localhost:5001',
  auth0: {
    domain: 'dev-3on2otf3kmyxv53z.us.auth0.com',
    clientId: 'hwsquizkgecZPiyytTWSdGkhbjt0AeS4',
    audience: 'https://localhost:5001'
  },
} as const;