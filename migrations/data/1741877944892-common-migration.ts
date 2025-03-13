import { MigrationInterface, QueryRunner } from "typeorm";

export class CommonMigration1741877944892 implements MigrationInterface {
    name = 'CommonMigration1741877944892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."answer_status_enum"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "question_id"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "date"`);
        await queryRunner.query(`CREATE TYPE "public"."answer_answerstatus_enum" AS ENUM('correct', 'incorrect')`);
        await queryRunner.query(`ALTER TABLE "answer" ADD "answerStatus" "public"."answer_answerstatus_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "answer" ADD "questionId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "answer" ADD "addedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "addedAt"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "questionId"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "answerStatus"`);
        await queryRunner.query(`DROP TYPE "public"."answer_answerstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "answer" ADD "date" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "answer" ADD "question_id" integer NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."answer_status_enum" AS ENUM('correct', 'incorrect')`);
        await queryRunner.query(`ALTER TABLE "answer" ADD "status" "public"."answer_status_enum" NOT NULL`);
    }

}
