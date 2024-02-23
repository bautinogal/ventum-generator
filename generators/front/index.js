import { copyAndReplaceDir } from '../../lib/index.js'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generate = async (schema, tables) => {
    const replace = {
        envPG: fs.readFileSync(path.join(__dirname, '../../config/.env'), 'utf8'),
        envjsPG: `{
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
                secret: process.env.JWT_SECRET || 'secret',
                saltWorkFactor: process.env.JWT_SWF || '10'
            },
        }`,
        MUItheme: `{
            ...${schema.properties.general.language},
            ...{
                typography: {
                    "fontFamily": "'Montserrat', sans-serif",
                    "fontSize": 14,
                    "fontWeightLight": 300,
                    "fontWeightRegular": 400,
                    "fontWeightMedium": 500
                },
                palette: {
                    ...defaultTheme.palette,
                    primary: {
                        main: '#DF8A0E',
                        light: '#FFBB3B',
                        dark: '#B37800',
                        contrastText: '#FFFFFF',
                    },
                    secondary: {
                        main: '#994895',
                        light: '#CA75C0',
                        dark: '#672C5F',
                        contrastText: '#FFFFFF',
                    },
                    info: {
                        main: '#0E99DF',
                        light: '#6AC0FF',
                        dark: '#0073AC',
                        contrastText: '#FFFFFF',
                    },
                    success: {
                        main: '#4CAF50',
                        light: '#80E27E',
                        dark: '#087F23',
                        contrastText: '#FFFFFF',
                    },
                    error: {
                        main: '#F44336',
                        light: '#FF7961',
                        dark: '#BA000D',
                        contrastText: '#FFFFFF',
                    },
                    warning: {
                        main: '#FF9800',
                        light: '#FFC947',
                        dark: '#C66900',
                        contrastText: '#000000',
                    },
                },
            }
        };`
    };

    await copyAndReplaceDir(path.join(__dirname, 'template'), path.join(__dirname, '../../../output/front'), replace);
};

export default { generate }
