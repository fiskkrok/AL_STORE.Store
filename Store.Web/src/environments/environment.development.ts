export const environment = {
    production: false,

    // API URLs
    apiUrls: {
        // Admin Portal API
        shop: {
            baseUrl: 'https://localhost:5001',

        },
        auth: {
        },
    },
    apiUrl: 'https://localhost:5001',
    auth0: {
        domain: 'your-auth0-domain',
        clientId: 'your-auth0-clientId',
        audience: 'your-auth0-audience'
    }
} as const;
