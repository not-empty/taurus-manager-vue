import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw("INSERT INTO `taurus-manager`.`group` (id, name) VALUES('01HYZW0Z01R04Z6H9AJW2AG0DN', 'Default')");
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw("DELETE FROM `taurus-manager`.group WHERE id='01HYZW0Z01R04Z6H9AJW2AG0DN'");
}
