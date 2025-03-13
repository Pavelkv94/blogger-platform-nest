import { MigrationInterface, QueryRunner } from "typeorm";

export class CommonMigration1741864282980 implements MigrationInterface {
    name = 'CommonMigration1741864282980'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_e2e6d984f70f61e5435c3be619d"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61"`);
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "gameId"`);
        await queryRunner.query(`ALTER TABLE "player" ADD "gameId" integer`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "UQ_7dfdd31fcd2b5aa3b08ed15fe8a" UNIQUE ("gameId")`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_e2e6d984f70f61e5435c3be619d" FOREIGN KEY ("firstPlayerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61" FOREIGN KEY ("secondPlayerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_7dfdd31fcd2b5aa3b08ed15fe8a" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_7dfdd31fcd2b5aa3b08ed15fe8a"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_e2e6d984f70f61e5435c3be619d"`);
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "UQ_7dfdd31fcd2b5aa3b08ed15fe8a"`);
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "gameId"`);
        await queryRunner.query(`ALTER TABLE "player" ADD "gameId" character varying`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61" FOREIGN KEY ("secondPlayerId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_e2e6d984f70f61e5435c3be619d" FOREIGN KEY ("firstPlayerId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
