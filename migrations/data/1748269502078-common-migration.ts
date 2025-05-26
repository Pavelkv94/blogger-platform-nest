import { MigrationInterface, QueryRunner } from "typeorm";

export class CommonMigration1748269502078 implements MigrationInterface {
    name = 'CommonMigration1748269502078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" ALTER COLUMN "updatedAt" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
    }

}
