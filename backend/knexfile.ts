import type { Knex } from 'knex';
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
} from './src/config/db';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql',
    connection: {
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
    },
    migrations: {
      tableName: 'migrations',
      directory: './src/database/migrations',
    },
  },

  staging: {
    client: 'mysql',
    connection: {
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
    },
    migrations: {
      tableName: 'migrations',
      directory: './src/database/migrations',
    },
  },
  production: {
    client: 'mysql',
    connection: {
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
    },
    migrations: {
      tableName: 'migrations',
      directory: './src/database/migrations',
    },
  },
};

export default config;
