import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { QuestionCreateDto } from '../dto/question-create.dto';
import { QuestionViewDto } from '../dto/question-view.dto';
import { CreateQuestionCommand } from '../application/usecases/create-question.usecase';
import { QuestionsQueryRepository } from '../infrastructure/questions.query-repository';
import { GetQuestionsQueryParams } from '../dto/get-questions-query-params.input-dto';
import { PaginatedQuestionViewDto } from 'src/core/dto/base.paginated.view-dto';
import { SwaggerGet } from 'src/core/decorators/swagger/swagger-get';
import { SwaggerAuthStatus } from 'src/core/decorators/swagger/swagger-options';
import { SwaggerDelete } from 'src/core/decorators/swagger/swagger-delete';
import { DeleteQuestionCommand } from '../application/usecases/delete-question.usecase';
import { SwaggerPut } from 'src/core/decorators/swagger/swagger-put';
import { UpdateQuestionCommand } from '../application/usecases/update-question.usecase';
import { QuestionPublishDto, QuestionUpdateDto } from '../dto/question-update.dto';
import { SwaggerPostCreate } from 'src/core/decorators/swagger/swagger-post';
import { PublishQuestionCommand } from '../application/usecases/publish-question.usecase';
@ApiTags('Questions') //swagger
@ApiBasicAuth() //swagger
@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
export class SaQuestionsController {
  constructor(
    private readonly questionsQueryRepository: QuestionsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @SwaggerGet('Get all questions', PaginatedQuestionViewDto, SwaggerAuthStatus.WithoutAuth) //swagger
  @Get()
  findQuestions(@Query() query: GetQuestionsQueryParams): Promise<PaginatedQuestionViewDto> {
    const questions = this.questionsQueryRepository.findQuestions(query);
    return questions;
  }

  @SwaggerPostCreate('Create a new question', QuestionViewDto, SwaggerAuthStatus.WithAuth) //swagger
  @ApiBasicAuth() //swagger
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(@Body() body: QuestionCreateDto): Promise<QuestionViewDto> {
    const questionId = await this.commandBus.execute(new CreateQuestionCommand(body));
    const newQuestion = await this.questionsQueryRepository.findQuestionByIdOrNotFoundFail(questionId);

    return newQuestion;
  }

  @SwaggerPut('Update a question by ID') //swagger
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateQuestion(@Param('id') id: string, @Body() body: QuestionUpdateDto): Promise<void> {
    return this.commandBus.execute(new UpdateQuestionCommand(id, body));
  }

  @SwaggerPut('Publish/unpublish question') //swagger
  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  publishQuestion(@Param('id') id: string, @Body() body: QuestionPublishDto): Promise<void> {
    return this.commandBus.execute(new PublishQuestionCommand(id, body));
  }

  @SwaggerDelete('Delete a question by ID', 'Question ID') //swagger
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteQuestion(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteQuestionCommand(id));
  }
}
