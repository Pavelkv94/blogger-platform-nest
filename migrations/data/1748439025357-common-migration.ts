import { MigrationInterface, QueryRunner } from "typeorm";

export class CommonMigration1748439025357 implements MigrationInterface {
    name = 'CommonMigration1748439025357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_confirmation" ("userId" integer NOT NULL, "confirmationCode" character varying NOT NULL, "isConfirmed" boolean NOT NULL DEFAULT false, "expirationDate" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_28d3d3fbd7503f3428b94fd18cc" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "recovery_confirmation" ("userId" integer NOT NULL, "recoveryCode" character varying, "recoveryExpirationDate" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_7dad518ae421831df936b74210f" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "security_device" ("deviceId" character varying NOT NULL, "title" character varying NOT NULL, "ip" character varying NOT NULL, "lastActiveDate" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "expirationDate" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_e1082e99fbd015027511dc96555" PRIMARY KEY ("deviceId"))`);
        await queryRunner.query(`CREATE TABLE "blog" ("id" SERIAL NOT NULL, "name" character varying(15) COLLATE "C" NOT NULL, "description" character varying(500) COLLATE "C" NOT NULL, "websiteUrl" character varying(100) COLLATE "C" NOT NULL, "isMembership" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_85c6532ad065a448e9de7638571" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "title" character varying(30) COLLATE "C" NOT NULL, "shortDescription" character varying(100) COLLATE "C" NOT NULL, "content" character varying(1000) COLLATE "C" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "blogId" integer NOT NULL, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "content" character varying(300) COLLATE "C" NOT NULL, "postId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "commentatorId" integer NOT NULL, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."like_parenttype_enum" AS ENUM('post', 'comment')`);
        await queryRunner.query(`CREATE TYPE "public"."like_status_enum" AS ENUM('Dislike', 'Like', 'None')`);
        await queryRunner.query(`CREATE TABLE "like" ("id" SERIAL NOT NULL, "parentType" "public"."like_parenttype_enum" NOT NULL, "parentId" integer NOT NULL, "status" "public"."like_status_enum" NOT NULL DEFAULT 'None', "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."answer_answerstatus_enum" AS ENUM('correct', 'incorrect')`);
        await queryRunner.query(`CREATE TABLE "answer" ("id" SERIAL NOT NULL, "answer" character varying NOT NULL, "answerStatus" "public"."answer_answerstatus_enum" NOT NULL, "questionId" integer NOT NULL, "addedAt" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer NOT NULL, CONSTRAINT "PK_9232db17b63fb1e94f97e5c224f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "player" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "score" integer NOT NULL DEFAULT '0', "status" character varying, "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "login" character varying COLLATE "C" NOT NULL, "email" character varying COLLATE "C" NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_a62473490b3e4578fd683235c5e" UNIQUE ("login"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question" ("id" SERIAL NOT NULL, "body" character varying COLLATE "C" NOT NULL, "correctAnswers" jsonb NOT NULL, "published" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE, "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game_questions" ("id" SERIAL NOT NULL, "questionId" integer NOT NULL, "gameId" integer NOT NULL, "index" integer NOT NULL, CONSTRAINT "PK_8655fa1f9639162ee24c3a5582a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."game_gamestatus_enum" AS ENUM('PendingSecondPlayer', 'Active', 'Finished')`);
        await queryRunner.query(`CREATE TABLE "game" ("id" SERIAL NOT NULL, "firstPlayerId" integer, "secondPlayerId" integer, "gameStatus" "public"."game_gamestatus_enum" NOT NULL, "pairCreatedDate" TIMESTAMP NOT NULL DEFAULT now(), "startGameDate" TIMESTAMP WITH TIME ZONE, "finishGameDate" TIMESTAMP WITH TIME ZONE, CONSTRAINT "REL_e2e6d984f70f61e5435c3be619" UNIQUE ("firstPlayerId"), CONSTRAINT "REL_ee762a5104680b6af6cf7b94f6" UNIQUE ("secondPlayerId"), CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" ADD CONSTRAINT "FK_28d3d3fbd7503f3428b94fd18cc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recovery_confirmation" ADD CONSTRAINT "FK_7dad518ae421831df936b74210f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "security_device" ADD CONSTRAINT "FK_1e91b753c2a4f691abce668fcf9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_d0418ddc42c5707dbc37b05bef9" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_2f689407da0fa968dfc922ab3b6" FOREIGN KEY ("commentatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "FK_5c486122f6925ef0e8fefd5fc75" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_7687919bf054bf262c669d3ae21" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_questions" ADD CONSTRAINT "FK_2f2de5b0489bd9ecea902b3c3e6" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_questions" ADD CONSTRAINT "FK_a0545c377fe4b81dfb82497b19a" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_e2e6d984f70f61e5435c3be619d" FOREIGN KEY ("firstPlayerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61" FOREIGN KEY ("secondPlayerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_e2e6d984f70f61e5435c3be619d"`);
        await queryRunner.query(`ALTER TABLE "game_questions" DROP CONSTRAINT "FK_a0545c377fe4b81dfb82497b19a"`);
        await queryRunner.query(`ALTER TABLE "game_questions" DROP CONSTRAINT "FK_2f2de5b0489bd9ecea902b3c3e6"`);
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_7687919bf054bf262c669d3ae21"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "FK_5c486122f6925ef0e8fefd5fc75"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_e8fb739f08d47955a39850fac23"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_2f689407da0fa968dfc922ab3b6"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_d0418ddc42c5707dbc37b05bef9"`);
        await queryRunner.query(`ALTER TABLE "security_device" DROP CONSTRAINT "FK_1e91b753c2a4f691abce668fcf9"`);
        await queryRunner.query(`ALTER TABLE "recovery_confirmation" DROP CONSTRAINT "FK_7dad518ae421831df936b74210f"`);
        await queryRunner.query(`ALTER TABLE "email_confirmation" DROP CONSTRAINT "FK_28d3d3fbd7503f3428b94fd18cc"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`DROP TYPE "public"."game_gamestatus_enum"`);
        await queryRunner.query(`DROP TABLE "game_questions"`);
        await queryRunner.query(`DROP TABLE "question"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "player"`);
        await queryRunner.query(`DROP TABLE "answer"`);
        await queryRunner.query(`DROP TYPE "public"."answer_answerstatus_enum"`);
        await queryRunner.query(`DROP TABLE "like"`);
        await queryRunner.query(`DROP TYPE "public"."like_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."like_parenttype_enum"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "blog"`);
        await queryRunner.query(`DROP TABLE "security_device"`);
        await queryRunner.query(`DROP TABLE "recovery_confirmation"`);
        await queryRunner.query(`DROP TABLE "email_confirmation"`);
    }

}
