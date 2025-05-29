import { MigrationInterface, QueryRunner } from "typeorm";

export class CommonMigration1748528913210 implements MigrationInterface {
    name = 'CommonMigration1748528913210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_questions" DROP CONSTRAINT "FK_2f2de5b0489bd9ecea902b3c3e6"`);
        await queryRunner.query(`ALTER TABLE "game_questions" DROP COLUMN "questionId"`);
        await queryRunner.query(`ALTER TABLE "game_questions" ADD "questionId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5"`);
        await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "question" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "game_questions" ADD CONSTRAINT "FK_2f2de5b0489bd9ecea902b3c3e6" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_questions" DROP CONSTRAINT "FK_2f2de5b0489bd9ecea902b3c3e6"`);
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5"`);
        await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "question" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "game_questions" DROP COLUMN "questionId"`);
        await queryRunner.query(`ALTER TABLE "game_questions" ADD "questionId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game_questions" ADD CONSTRAINT "FK_2f2de5b0489bd9ecea902b3c3e6" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
