import env from '../config/env.js';
import fs from 'fs';
import { log, utils as u, crypto } from '../lib/index.js';
import { build } from './builder.js';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  schema as tablesSchema, schemasHash, getCache, query, getRows, getRow, getPaginatedRows, getRowCDC,
  postRow, editRow, delRow, addListener, removeListener
} from '../lib/tables/index.js';

let schema = fs.readFileSync(path.join(__dirname, '../../schema.json'), 'utf8');


export default build([
  {
    route: '/api/authenticate',
    description: 'Authenticate user by email and password, returns JWT, rols and permissions.',
    method: 'post',
    validations: {
      auth: null,
      query: null,
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
        required: ["email", "password"],
        additionalProperties: false,
      },
      params: null
    },
    action: async (req, res) => {
      const { email, password } = req.body;
      //const user = await getRow('users', { email, password: await crypto.hash(password) });
      const user = { ...await getRow('users', { email, password }) };
      if (!user) {
        res.status(401);
        res.body = { error: 'Invalid email or password' };
      } else {
        delete user.password;
        const rolIds = (await getRows('usersRolsMap', { userId: user.id })).map(x => x.rolId);
        const rols = await getRows('rols', rol => rolIds.includes(rol.id));
        //const rolIds = rols.map(row => row.rolId);
        const customPermissionsIds = Array.from(new Set((await getRows('rolsCustomPermissionsMap',
          row => rolIds.includes(row.rolId))).map(x => x.customPermissionId)));
        const genericPermissionsIds = Array.from(new Set((await getRows('rolsGenericPermissionsMap',
          row => rolIds.includes(row.rolId))).map(x => x.genericPermissionId)));
        const customPermissions = await getRows('customPermissions', row => customPermissionsIds.includes(row.id));
        const genericPermissions = await getRows('genericPermissions', row => genericPermissionsIds.includes(row.id));

        res.headers = { auth: crypto.createJWT({ id: user.id, expiration: Date.now() + env.dfltExpiration }) };
        res.body = { user, rols, customPermissions, genericPermissions };
      }
    }
  },
  {
    route: '/api/tables-schema',
    description: 'Authenticate user by email and password, returns JWT, rols and permissions.',
    method: 'get',
    validations: {},
    action: async (req, res) => {
      res.body = tablesSchema;
    }
  },
  {
    route: '/api/schema',
    description: 'Authenticate user by email and password, returns JWT, rols and permissions.',
    method: 'get',
    validations: {},
    action: async (req, res) => {
      res.body = schema;
    }
  },
  {
    route: '/api/tables/:tableName/rows',
    description: 'Authenticate user by email and password, returns JWT, rols and permissions.',
    method: 'get',
    validations: {},
    action: async (req, res) => {
      res.body = req?.query?.q ?
        await getPaginatedRows(req.params.tableName, req.query.q) :
        await getRows(req.params.tableName);
    }
  },
  {
    route: '/api/tables/:tableName/row',
    description: 'Authenticate user by email and password, returns JWT, rols and permissions.',
    method: 'get',
    validations: {},
    action: async (req, res) => {
      res.body = await getRow(req.params.tableName, JSON.parse(req.params.where));
    }
  },
  {
    route: '/api/tables/:tableName/history',
    description: 'Authenticate user by email and password, returns JWT, rols and permissions.',
    method: 'get',
    validations: {},
    action: async (req, res) => {
      res.body = await getRowCDC(req.params.tableName, JSON.parse(req.params.where));
    }
  },
  {
    route: '/api/tables/:tableName/raw',
    description: 'Authenticate user by email and password, returns JWT, rols and permissions.',
    method: 'get',
    validations: {},
    action: async (req, res) => {
      res.body = (await getCache())[req.params.tableName];
    }
  },
]);
