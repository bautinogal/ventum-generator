//This lib is used to communicate exclusively with our backend. It is a wrapper around fetch, and it adds some useful features like automatic auth headers.
import store from '../../redux/store';
import { isJson } from '../utils';
import env from '../../config/env';
//const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = (path, method, headers = {}, body) => {
    const dfltHeaders = (typeof body === 'object' || isJson(body)) ? { "Content-Type": "application/json" } : {};
    let authorization = store.getState().auth.jwt ? "bearer " + store.getState().auth.jwt : undefined;
    return ({ ...dfltHeaders, authorization, ...headers });
};
const _fetch = async (path, method, headers, body) => {
    path = env.backendUrl + path;
    headers = getHeaders(path, method, headers, body);
    let reqBody = typeof body === 'object' ? JSON.stringify(body) : (body == null ? body : body.toString());
    let rawRes = await fetch(path, { headers, method, body: reqBody });
    let resBody = await rawRes.text();
    //resBody = resBody != "" ? resBody : null;
    resBody = isJson(resBody) ? JSON.parse(resBody) : resBody;

    return {
        body: resBody,
        bodyUsed: rawRes.bodyUsed,
        headers: Array.from(rawRes.headers).reduce((p, x) => ({ ...p, ...{ [x[0]]: x[1] } }), {}),
        ok: rawRes.ok,
        redirected: rawRes.redirected,
        status: rawRes.status,
        statusText: rawRes.statusText,
        type: rawRes.status.type,
        path,
    };
};

export const get = (path, headers) => _fetch(path, "GET", headers);
export const post = (path, headers, body) => _fetch(path, "POST", headers, body);
export const put = (path, headers, body) => _fetch(path, "PUT", headers, body);
export const del = (path, headers, body) => _fetch(path, "DELETE", headers, body);
export const patch = (path, headers, body) => _fetch(path, "PATCH", headers, body);


export default { get, post, put, del, patch };