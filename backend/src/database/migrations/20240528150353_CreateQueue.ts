import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('queue', (table) => {
      table.string('id').primary();
      table.string('name').notNullable();
      table.text('description').nullable();
      table.string('host').notNullable();
      table.integer('port').notNullable();
      table.string('compliance').nullable();
      table.string('group_id').notNullable();
      table.foreign('group_id').references('id').inTable('group');
      table.integer('health_value').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('deleted_at').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('queue');
}
