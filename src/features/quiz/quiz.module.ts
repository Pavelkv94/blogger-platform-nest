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
const useCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  PublishQuestionUseCase,
  DeleteQuestionUseCase
];

const repositories = [
  QuestionsRepository, 
  QuestionsQueryRepository
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
    TypeOrmModule.forFeature([Question]),
  ],
  exports: [],
  controllers: [SaQuestionsController],
  providers: [...useCases, ...repositories, JwtAccessStrategy],
})
export class QuizModule {}
