import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDefaultGroup1625854127800 implements MigrationInterface {
    name = 'AddDefaultGroup1625854127800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("INSERT INTO `taurus-manager`.`group` (id, name) VALUES('cabfc951-f483-4870-9e72-cc5935335349', 'Default')");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DELETE FROM `taurus-manager`.group WHERE id='cabfc951-f483-4870-9e72-cc5935335349'");
    }

}



