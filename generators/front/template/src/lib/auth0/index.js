import env from '../../config/env.js';
import history from "../utils/history.js";

export const config = {
    domain: env.auth0.domain,
    clientId: env.auth0.clientId,
    onRedirectCallback: appState => history.push(appState?.targetUrl ? appState.targetUrl : window.location.pathname),
    authorizationParams: {
        redirect_uri: window.location.origin,
        audience: env.auth0.audience,
        redirectURI: env.auth0.redirectURI,
    },
};