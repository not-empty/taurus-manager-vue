import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAdminUser1625620159500 implements MigrationInterface {
    name = 'AddAdminUser1625620159500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("INSERT INTO `taurus-manager`.`user` (id, name, login, password, `role`, created_at, updated_at) VALUES('72bcb5c2-db43-4479-b020-1d5c62c64f06', 'Admin', 'admin', '$2b$08$/3RYbngOk51fhuxnNtpX.OdgcNwmH4YN/g0HRD0vXnjAMwXA1DLFe', 'administrator', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DELETE FROM `taurus-manager`.user WHERE id='72bcb5c2-db43-4479-b020-1d5c62c64f06'");
    }

}



