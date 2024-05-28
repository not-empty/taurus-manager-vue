import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('user', (table) => {
      table.string('id').primary();
      table.string('name').notNullable();
      table.string('login').notNullable();
      table.string('password').notNullable();
      table.string('role').notNullable();
      table.tinyint('allow_all').defaultTo(1);
      table.string('groups');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('deleted_at').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user');
}
