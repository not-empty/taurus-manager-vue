import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('group', (table) => {
      table.string('id').primary();
      table.string('name').notNullable();
      table.text('description').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('deleted_at').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('group');
}
