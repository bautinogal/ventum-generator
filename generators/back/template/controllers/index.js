import env from '../config/env.js';
import fs from 'fs';
import { log, utils as u, crypto } from '../lib/index.js';
import { build } from './builder.js';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  schema as tablesSchema, schemasHash, getCache, runQuery, getRows, getRow, getPaginatedRows, getRowCDC,
  postRow, editRow, delRow, addListener, removeListener
} from '../lib/tables/index.js';

let schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../../schema.json'), 'utf8'));

const removeHiddenCols = (() => {
  const hiddenCols = Object.entries(schema.properties.tables.properties)
    .reduce((p, [tableName, tableSchema]) => {
      p[tableName] = Object.entries(tableSchema.items.properties)
        .filter(([col, colSchema]) => colSchema.hidden)
        .map(([col, colSchema]) => col);
      return p;
    }, {});

    console.log('hiddenCols', hiddenCols);  

  return (row, tableName) => {
    const tableHiddenCols = hiddenCols[tableName];
    return Object.entries(row).reduce((p, [col, val]) => {
      if (!tableHiddenCols.includes(col)) p[col] = val;
      return p;
    }, {});
  };

})();

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
      const user = await getRow('users', { email, password });
      if (!user) {
        res.status(401);
        res.body = { error: 'Invalid email or password' };
      } else {
        const _user = { ...user };
        delete _user.password;
        const rolIds = (await getRows('usersRolsMap', { userId: _user.id })).map(x => x.rolId);
        const rols = await getRows('rols', rol => rolIds.includes(rol.id));
        //const rolIds = rols.map(row => row.rolId);
        const customPermissionsIds = Array.from(new Set((await getRows('rolsCustomPermissionsMap',
          row => rolIds.includes(row.rolId))).map(x => x.customPermissionId)));
        const genericPermissionsIds = Array.from(new Set((await getRows('rolsGenericPermissionsMap',
          row => rolIds.includes(row.rolId))).map(x => x.genericPermissionId)));
        const customPermissions = await getRows('customPermissions', row => customPermissionsIds.includes(row.id));
        const genericPermissions = await getRows('genericPermissions', row => genericPermissionsIds.includes(row.id));

        const jwt = crypto.createJWT({ id: _user.id, expiration: Date.now() + env.jwt.duration });
        res.headers = { auth: jwt };
        res.body = { user: _user, rols, customPermissions, genericPermissions, jwt };
      }
    }
  },
  {
    route: '/api/schema',
    description: 'JSON schema.',
    method: 'get',
    validations: {},
    action: async (req, res) => {
      res.body = schema;
    }
  },
  {
    route: '/api/tables-schema',
    description: 'Schema of sql tables.',
    method: 'get',
    validations: {},
    action: async (req, res) => {
      res.body = tablesSchema;
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

      res.body = res.body.map(x => removeHiddenCols(x, req.params.tableName));
    }
  },
  {
    route: '/api/tables/:tableName/row',
    description: 'Authenticate user by email and password, returns JWT, rols and permissions.',
    method: 'get',
    validations: {},
    action: async (req, res) => {
      res.body = await getRow(req.params.tableName, JSON.parse(req.params.where));
      res.body = removeHiddenCols(res.body, req.params.tableName);
    }
  },
  {
    route: '/api/tables/:tableName/history',
    description: 'Authenticate user by email and password, returns JWT, rols and permissions.',
    method: 'get',
    validations: {},
    action: async (req, res) => {
      res.body = await getRowCDC(req.params.tableName, JSON.parse(req.params.where));
      res.body = res.body.map(x => removeHiddenCols(x, req.params.tableName));
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
  {
    route: '/api/tables/:tableName',
    description: 'Post row in table.',
    method: 'post',
    validations: {},
    action: async (req, res) => {
      res.body = await postRow(req.params.tableName, req.body);
    }
  },
]);
