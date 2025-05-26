import { MigrationInterface, QueryRunner } from "typeorm";

export class CommonMigration1748268575800 implements MigrationInterface {
    name = 'CommonMigration1748268575800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" ALTER COLUMN "updatedAt" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" ALTER COLUMN "updatedAt" SET NOT NULL`);
    }

}
