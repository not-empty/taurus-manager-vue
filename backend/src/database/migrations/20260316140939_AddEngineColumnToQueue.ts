import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .table('queue', (table) => {
      table.string('engine').after('name').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('queue', (table) => {
    table.dropColumn('engine');
  });
}
