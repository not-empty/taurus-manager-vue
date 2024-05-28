import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw("INSERT INTO `taurus-manager`.`user` (id, name, login, password, `role`, created_at, updated_at) VALUES('01HYZW0GD5Q2VQF7ZNVVA4HSAK', 'Admin', 'admin', '$2b$08$/3RYbngOk51fhuxnNtpX.OdgcNwmH4YN/g0HRD0vXnjAMwXA1DLFe', 'administrator', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw("DELETE FROM `taurus-manager`.user WHERE id='01HYZW0GD5Q2VQF7ZNVVA4HSAK'");
}
