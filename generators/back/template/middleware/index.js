import { log, crypto } from '../lib/index.js';
import env from '../config/env.js';
import express from 'express';
import cors from 'cors';
import { getRow, getRows } from '../lib/tables/index.js';
import cookieParser from 'cookie-parser'; // Herramienta para parsear las cookies
import bodyParser from 'body-parser'; // Herramienta para parsear el "cuerpo" de los requests
import path from 'path';
import { v4 } from 'uuid';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sql = null;

const limitedArrStr = (arr, initialN = 10, endN = 0) => {
  let res = "";
  initialN = Math.min(initialN, arr.length);
  let initialArr = arr.slice(0, initialN);
  endN = Math.min(endN, arr.length - initialN);
  endN = endN > 0 ? endN : 0;
  let endArr = arr.slice(arr.length - endN, arr.length);
  let n = arr.length - initialArr.length - endN;
  let moreRows = n > 0 ? [`...${n} more rows`] : [];
  res += JSON.stringify([...initialArr, ...moreRows, ...endArr], null, 2);
  return res;
};

//Agrego todos los middlewares
export const before = (app) => {

  const addMiddleware = (app) => {

    app.use(cors({ origin: true, credentials: true }));
    //app.use('/static', express.static(process.cwd() + '/static'));

    //app.use('/', express.static(path.join(__dirname, '..', 'public', 'ecommerce')));
    app.use(express.static(path.join(__dirname, '..', 'static')));
    //app.use(express.static(path.join(__dirname, '..', 'landing')));
    app.use(cookieParser());
    //"bodyParser" es un middleware que me ayuda a parsear los requests
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: '20mb' }));
    app.use((err, req, res, next) => {
      if (err instanceof SyntaxError) {
        res.code = 400;
        res.body = 'Invalid Request Syntax';
      } else {
        throw err;
      }
      next();
    });
    app.use(cors({
      credentials: true,
      origin: true
    }));
    //app.use(upload.any());
    return app;
  };

  const addUtils = (req, res, next) => {
    res.status(200);
    res.body = {};
    res.ok = () => (res.statusCode >= 200 && res.statusCode < 300);
    res.setCode = (code) => {
      this.statusCode = code;
      return this
    }

    next();
  };

  const addReqData = async (req, res, next) => {

    const getAuth = async () => {

      const getData = async (auth) => {
        //const user = await getRow('users', { email, password: await crypto.hash(password) });
        const user = { ...await getRow('users', { id: auth.jwt.decodedJWT.payload.id }) };
        if (user) {
          delete user.password;
          const rolIds = (await getRows('usersRolsMap', { userId: user.id })).map(x => x.rolId);
          const rols = await getRows('rols', rol => rolIds.includes(rol.id));
          const customPermissionsIds = Array.from(new Set((await getRows('rolsCustomPermissionsMap',
            row => rolIds.includes(row.rolId))).map(x => x.customPermissionId)));
          const genericPermissionsIds = Array.from(new Set((await getRows('rolsGenericPermissionsMap',
            row => rolIds.includes(row.rolId))).map(x => x.genericPermissionId)));
          const customPermissions = await getRows('customPermissions', row => customPermissionsIds.includes(row.id));
          const genericPermissions = await getRows('genericPermissions', row => genericPermissionsIds.includes(row.id));

          auth.user = user;
          auth.rols = rols;
          auth.customPermissions = customPermissions;
          auth.genericPermissions = genericPermissions;
        };
        return auth;
      };

      let auth = null;
      const authHeader = req.headers['authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        auth = {
          jwt: {
            raw: authHeader.split('Bearer ')[1],
          }
        };
        try {
          auth.jwt.decodedJWT = crypto.verifyJWT(auth.jwt.raw);
          if (auth.jwt.decodedJWT?.payload?.expiration == null) throw new Error('Token without expiration');
          if (auth.jwt.decodedJWT?.payload?.expiration < Date.now()) throw new Error('Token expired');
          auth.jwt.valid = true;
        } catch (error) {
          log.error(`Error with auth JWT: ${error.message}`);
          auth.jwt.valid = false;
          auth.jwt.error = error.message;
        }

        if (auth.jwt.valid) {
          auth = await getData(auth);
        }
      }

      return auth;
    };

    req.auth = await getAuth();
    req.start = Date.now();
    req.uuid = v4();
    next();
  };

  app = addMiddleware(app);
  app.use(addUtils);
  app.use(addReqData);

  return app;
};

export const after = (app) => {

  const refreshAuth = (req, res, next) => {
    const oldAuth = req.auth?.jwt;
    if (oldAuth?.valid) {
      const auth = crypto.createJWT({
        id: oldAuth?.decodedJWT?.payload?.id,
        expiration: Date.now() + env.jwt.dfltExpiration,
      });
      res.set("auth", auth);
    }
    next();
  };

  const errorHandler = (err, req, res, next) => {

    console.log('errorHandler', err.stack);
    res.code = 500;
    res.message = null;
    res.error = err.stack;
    log.error(err);
    next();
  };

  const respond = (req, res, next) => {
    // console.log('respond', res.body);
    req.end = Date.now();
    res.send(res.body);
    next();
  };

  const logReq = async (req, res, next) => {
    const reqBody = JSON.stringify(req.body);
    const resBody = JSON.stringify(res.body);
    //Document with request info that will be stored at the DB
    const getRequestData = async (req) => {
      var result = {
        //url: req.protocol + "://" + req.get('host') + req.originalUrl,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        auth: req.auth,
        ts: Date.now(),
        remoteAddress: req.ip,
        url: req.url,
        method: req.method,
        cookies: req.cookies,
        headers: req.headers,
        params: req.params,
        query: req.query,
        body: req.body,
      };

      result.hash = await crypto.hash(result);
      req.hash = result.hash;
      return result;
    };

    //Logs request data (settings from enviroment variables)
    const logRequest = async (data) => {

      function getDateTimeWithMilliseconds(ts) {
        if (ts == null) return null;
        const date = new Date(ts);
        const milliseconds = date.getMilliseconds();
        const dateTimeWithoutMilliseconds = date.toLocaleString('en-GB', { timeZone: 'UTC' });


        const formattedMilliseconds = milliseconds.toString().padStart(3, '0');
        const dateTimeWithMilliseconds = `${dateTimeWithoutMilliseconds}.${formattedMilliseconds}`;

        return dateTimeWithMilliseconds;
      }

      const reqLogOptions = env.middleware.log.req;
      const resLogOptions = env.middleware.log.res;

      let logStr = `\x1b[35m>>\x1b[0m\x1b[32m HTTP\x1b[0m \x1b[36m${data.method}\x1b[0m \x1b[33m${data.url}\x1b[0m ${req.end - req.start}ms ${data.hash}\x1b[0m`

      //RESQUEST
      if (eval(reqLogOptions.req)) {
        logStr += (`
\x1b[35mREQ\x1b[0m from \x1b[33m${data.ip}\x1b[0m at ${getDateTimeWithMilliseconds(req.start)} (UTC)\x1b[0m`);
        if (eval(reqLogOptions?.headers)) logStr += (` 
  Headers: ${JSON.stringify(data.headers, null, 4)}`);
        if (reqLogOptions?.auth === 'oneline') logStr += (`
  Auth: ${JSON.stringify({ valid: data?.auth?.jwt.valid, expiration: getDateTimeWithMilliseconds(data?.auth?.jwt?.decodedJWT?.payload?.expiration), id: data?.auth?.jwt?.decodedJWT?.payload?.id, email: data?.auth?.user?.email, rols: data?.auth?.rols?.map(x => x.name) })}`);
        else if (eval(reqLogOptions.auth)) logStr += (`
  Auth: ${JSON.stringify(data.auth, null, 4)}`);
        if (reqLogOptions?.body === 'oneline') logStr += (`
  Body: ${reqBody?.substring(0, 80)}${reqBody && reqBody.length > 80 ? '...' : ''} (Length ${reqBody?.length})`);
        else if (eval(reqLogOptions.body)) logStr += (`
  Body: ${Array.isArray(data.body) ? limitedArrStr(data.body, 5) : JSON.stringify(data.body, null, 4)}`);
      }
      //RESPONSE
      if (eval(resLogOptions?.res) || true) {
        logStr += (`
\x1b[35mRES\x1b[0m code \x1b[32m${res.statusCode} \x1b[0m${getDateTimeWithMilliseconds(req.end)} (UTC)\x1b[0m`);
        if (eval(resLogOptions?.headers)) logStr += (` 
  Headers: ${JSON.stringify(res.getHeaders(), null, 4)}`);
        if (resLogOptions?.auth === 'oneline') logStr += (`
  Auth: ${JSON.stringify({ valid: res?.auth?.jwt?.valid, id: res?.auth?.personaId, email: res?.auth?.jwt?.payload.email, roles: res?.auth?.roles })}`);
        else if (eval(resLogOptions?.auth)) logStr += (`
  Auth: ${JSON.stringify(res.auth, null, 2)}`);
        if (resLogOptions?.body === 'oneline') logStr += (`
  Body: ${resBody?.substring(0, 80)}${resBody && resBody.length > 80 ? '...' : ''} (Length ${resBody?.length})`);
        else if (eval(resLogOptions?.body)) logStr += (`
  Body: ${Array.isArray(res.body) ? limitedArrStr(res.body, 5) : JSON.stringify(res.body, null, 4)}`);
      }

      log.info(`${logStr}\n`);
    };

    let reqData = await getRequestData(req);
    if (reqData) await logRequest(reqData);
    next();
  };

  app.use(refreshAuth);
  app.use(errorHandler);
  app.use(respond);
  app.use(logReq);
  return app;
};
