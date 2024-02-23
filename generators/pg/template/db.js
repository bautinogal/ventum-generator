import knex from 'knex';
import knexConfig from './knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Export the Knex instance
export default knex(config)
