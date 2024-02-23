//------------------------------- Enviroment Variables ----------------------------------
export default {
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
    auth0: {
        domain: import.meta.env.VITE_AUTH0_DOMAIN,
        clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        redirectURI: import.meta.env.VITE_AUTH0_REDIRECT_URI,
        returnTo: import.meta.env.VITE_AUTH0_RETURN_TO
    },
    tables: {
        cdc: {
            prefix: import.meta.env.TABLES_CDC_PREFIX || 'cdc_',
            id: import.meta.env.TABLES_CDC_PREFIX || 'cdc_id',
            action: import.meta.env.TABLES_CDC_PREFIX || 'cdc_action',
            createdAt: import.meta.env.TABLES_CDC_PREFIX || 'cdc_created_at',
            ignore: ['permissions'] 
        }
    }
}