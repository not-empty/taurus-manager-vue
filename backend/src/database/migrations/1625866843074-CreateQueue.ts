import {
  MigrationInterface, QueryRunner, Table, TableForeignKey,
} from 'typeorm';

export default class CreateQueue1625866843074 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'queue',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'host',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'port',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'compliance',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'group_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'health_value',
            type: 'integer',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'queue',
      new TableForeignKey({
        name: 'QueueGroup',
        columnNames: ['group_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'group',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('queue');
  }
}
