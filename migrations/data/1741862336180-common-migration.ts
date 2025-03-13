import { MigrationInterface, QueryRunner } from "typeorm";

export class CommonMigration1741862336180 implements MigrationInterface {
    name = 'CommonMigration1741862336180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."game_gamestatus_enum" RENAME TO "game_gamestatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."game_gamestatus_enum" AS ENUM('PendingSecondPlayer', 'Active', 'Finished')`);
        await queryRunner.query(`ALTER TABLE "game" ALTER COLUMN "gameStatus" TYPE "public"."game_gamestatus_enum" USING "gameStatus"::"text"::"public"."game_gamestatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."game_gamestatus_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."game_gamestatus_enum_old" AS ENUM('PENDING_SECOND_PLAYER', 'ACTIVE', 'FINISHED')`);
        await queryRunner.query(`ALTER TABLE "game" ALTER COLUMN "gameStatus" TYPE "public"."game_gamestatus_enum_old" USING "gameStatus"::"text"::"public"."game_gamestatus_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."game_gamestatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."game_gamestatus_enum_old" RENAME TO "game_gamestatus_enum"`);
    }

}
