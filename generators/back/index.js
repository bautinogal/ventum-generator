import { copyAndReplaceDir } from '../../lib/index.js'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generate = async (schema, tables) => {

    const replace = {
        envBack: fs.existsSync(path.join(__dirname, '../../config/.env')) ?
            fs.readFileSync(path.join(__dirname, '../../config/.env'), 'utf8') : '',
        envjsBack: `{
            admin: {
                email: process.env.APP_ADMIN_EMAIL || 'admin@admin',
                password: process.env.APP_ADMIN_PASS || 'admin',
                name: process.env.APP_ADMIN_NAME || 'admin',
                lastName: process.env.APP_ADMIN_LAST_NAME || 'admin'
            },
            ddbb: {
                connection: {
                    database: process.env.TABLES_DDBB_CONNECTION_DATABASE || 'demo',
                    user: process.env.TABLES_DDBB_CONNECTION_USER || 'postgres',
                    password: process.env.TABLES_DDBB_CONNECTION_PASSWORD || 'postgres',
                },
                pool: {
                    min: process.env.TABLES_DDBB_POOL_MIN || 2,
                    max: process.env.TABLES_DDBB_POOL_MAX || 10
                },
                migrations: {
                    tableName: process.env.TABLES_DDBB_MIGRATION_TABLENAME || 'knex_migrations'
                },
                seeds: {
                    directory: process.env.TABLES_DDBB_SEEDS_DIRECTORY || './seeds'
                }
            },
            app: {
                env: process.env.APP_NODE_ENV || 'development',
                ssl_port: parseInt(process.env.APP_SSL_PORT) || 443,
                port: parseInt(process.env.APP_PORT) || 8080,
                logLevel: parseInt(process.env.APP_LOG_LEVEL) || 0
            },
            tables: {
                pg: {
                    host: process.env.PG_HOST || 'localhost',
                    port: process.env.PG_PORT || 5432,
                    database: process.env.PG_DDBB || 'demo',
                    user: process.env.PG_USER || 'postgres',
                    password: process.env.PG_PASSWORD || 'postgres',
                },
                cdc: {
                    prefix: process.env.TABLES_CDC_PREFIX || 'cdc_',
                    id: process.env.TABLES_CDC_ID || 'cdc_id',
                    action: process.env.TABLES_CDC_ACTION || 'cdc_action',
                    editedAt: process.env.TABLES_CDC_EDITED_AT || 'cdc_edited_at',
                    editedBy: process.env.TABLES_CDC_EDITED_BY || 'cdc_edited_by',
                    ignore: [] // U: tables to ignore in CDC
                }
            },
            jwt: {
                duration: parseInt(process.env.JWT_DURATION || '600000'),
                secret: process.env.JWT_SECRET || 'secret',
                saltWorkFactor: parseInt(process.env.JWT_SWF || '10')
            },
            middleware: {
                log: {
                  req: {
                    req: process.env.MIDDLEWARE_LOG_REQ_REQ || true,
                    ip: process.env.MIDDLEWARE_LOG_REQ_IP || true,
                    url: process.env.MIDDLEWARE_LOG_REQ_URL || true,
                    method: process.env.MIDDLEWARE_LOG_REQ_METHOD || true,
                    query: process.env.MIDDLEWARE_LOG_REQ_QUERY || true,
                    headers: process.env.MIDDLEWARE_LOG_REQ_HEADERS || false,
                    body: process.env.MIDDLEWARE_LOG_REQ_BODY || 'oneline',
                    auth: process.env.MIDDLEWARE_LOG_REQ_AUTH || 'oneline',
                  },
                  res: {
                    res: process.env.MIDDLEWARE_LOG_RES_RES || true,
                    headers: process.env.MIDDLEWARE_LOG_RES_HEADERS || false,
                    body: process.env.MIDDLEWARE_LOG_RES_BODY || 'oneline',
                    auth: process.env.MIDDLEWARE_LOG_RES_AUTH || false,
                  }
                },
              }
        }`,
    };

    await copyAndReplaceDir(path.join(__dirname, 'template'), path.join(__dirname, '../../../output/back'), replace);
};

export default { generate }
