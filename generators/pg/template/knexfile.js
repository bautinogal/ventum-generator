import env from './config/env.js';

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  development: {
    ...env.ddbb,
    client: 'postgresql',
  },
};
