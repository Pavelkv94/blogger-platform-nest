import { Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CqrsModule } from '@nestjs/cqrs';
import { SaQuestionsController } from './questions/api/questions.sa.controller';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CoreConfig } from '../../core/core.config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from '../../core/guards/passport/jwt-access.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateQuestionUseCase } from './questions/application/usecases/create-question.usecase';
import { QuestionsRepository } from './questions/infrastructure/questions.repository';
import { QuestionsQueryRepository } from './questions/infrastructure/questions.query-repository';
import { Question } from './questions/domain/question.entity';
import { DeleteQuestionUseCase } from './questions/application/usecases/delete-question.usecase';
import { UpdateQuestionUseCase } from './questions/application/usecases/update-question.usecase';
import { PublishQuestionUseCase } from './questions/application/usecases/publish-question.usecase';
import { PairGameController } from './pairGame/api/pairGame.controller';
import { Game } from './pairGame/domain/game.entity';
import { Answer } from './pairGame/domain/answer.entity';
import { Player } from './pairGame/domain/player.entity';
import { GameQuestions } from './pairGame/domain/game-questions.entity';
import { CreatePlayerUseCase } from './pairGame/application/usecases/create-player.usecase';
import { ConnectToGamePairUseCase } from './pairGame/application/usecases/connect-game.usecase';
import { SelectQuestionsForGamePairUseCase } from './pairGame/application/usecases/select-questions-for-game.usecase';
import { GameQuestionsRepository } from './pairGame/infrastructure/game-questions.repository';
import { GameRepository } from './pairGame/infrastructure/game.repository';
import { PlayerRepository } from './pairGame/infrastructure/player.repository';
import { PlayerQueryRepository } from './pairGame/infrastructure/player.query-repository';
import { GameQueryRepository } from './pairGame/infrastructure/game.query-repository';
import { CreateAnswerUseCase } from './pairGame/application/usecases/create-answer.usecase';
import { AnswerRepository } from './pairGame/infrastructure/answer.repository';
import { AnswerQueryRepository } from './pairGame/infrastructure/answer.query-repository';
import { GameQuestionsQueryRepository } from './pairGame/infrastructure/game-questions.query-repository';
import { FinishGameUseCase } from './pairGame/application/usecases/finish-game.usecase';
import { GetMyStatisticUseCase } from './pairGame/application/usecases/get-my-stat.usecase';

const useCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  PublishQuestionUseCase,
  DeleteQuestionUseCase,
  ConnectToGamePairUseCase,
  CreatePlayerUseCase,
  SelectQuestionsForGamePairUseCase,
  CreateAnswerUseCase,
  FinishGameUseCase,
  GetMyStatisticUseCase
  
];

const repositories = [
  QuestionsRepository, 
  QuestionsQueryRepository,
  PlayerRepository,
  PlayerQueryRepository,
  GameRepository,
  GameQueryRepository,
  GameQuestionsRepository,
  AnswerRepository,
  AnswerQueryRepository,
  GameQuestionsQueryRepository
];

@ApiTags('Quiz') //swagger
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (coreConfig: CoreConfig) => ({
        secret: coreConfig.accessTokenSecret,
      }),
      inject: [CoreConfig],
    }),
    CqrsModule,
    UserAccountsModule,
    TypeOrmModule.forFeature([Question, Game, GameQuestions, Player, Answer]),
  ],
  exports: [],
  controllers: [SaQuestionsController, PairGameController],
  providers: [...useCases, ...repositories, JwtAccessStrategy],
})
export class QuizModule {}
