import { MigrationInterface, QueryRunner } from "typeorm";

export class CommonMigration1748529696862 implements MigrationInterface {
    name = 'CommonMigration1748529696862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."answer_answerstatus_enum" RENAME TO "answer_answerstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."answer_answerstatus_enum" AS ENUM('Correct', 'Incorrect')`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "answerStatus" TYPE "public"."answer_answerstatus_enum" USING "answerStatus"::"text"::"public"."answer_answerstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."answer_answerstatus_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."answer_answerstatus_enum_old" AS ENUM('correct', 'incorrect')`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "answerStatus" TYPE "public"."answer_answerstatus_enum_old" USING "answerStatus"::"text"::"public"."answer_answerstatus_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."answer_answerstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."answer_answerstatus_enum_old" RENAME TO "answer_answerstatus_enum"`);
    }

}
