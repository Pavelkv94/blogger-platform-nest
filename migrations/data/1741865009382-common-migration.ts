import { MigrationInterface, QueryRunner } from "typeorm";

export class CommonMigration1741865009382 implements MigrationInterface {
    name = 'CommonMigration1741865009382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_7dfdd31fcd2b5aa3b08ed15fe8a"`);
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "UQ_7dfdd31fcd2b5aa3b08ed15fe8a"`);
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "gameId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" ADD "gameId" integer`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "UQ_7dfdd31fcd2b5aa3b08ed15fe8a" UNIQUE ("gameId")`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_7dfdd31fcd2b5aa3b08ed15fe8a" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
