import knex from 'knex';
import { Model, knexSnakeCaseMappers } from 'objection';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USERNAME } from '../config/db';

const connection = knex({
  client: 'mysql',
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
  },
  ...knexSnakeCaseMappers()
});

Model.knex(connection);

export default connection;