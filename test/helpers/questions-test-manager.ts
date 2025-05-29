import { HttpStatus, INestApplication } from '@nestjs/common';
import { PaginatedQuestionViewDto } from 'src/core/dto/base.paginated.view-dto';
import { QuestionCreateDto } from 'src/features/quiz/questions/dto/question-create.dto';
import { QuestionViewDto } from 'src/features/quiz/questions/dto/question-view.dto';
import { GetQuestionsQueryParams } from 'src/features/quiz/questions/dto/get-questions-query-params.input-dto';
import request from 'supertest';
import { delay } from './delay';
import { QuestionUpdateDto } from 'src/features/quiz/questions/dto/question-update.dto';
import { QuestionPublishDto } from 'src/features/quiz/questions/dto/question-update.dto';
export class QuestionsTestManager {
  constructor(private readonly app: INestApplication) {}

  async getQuestions(query: GetQuestionsQueryParams | object = {}): Promise<PaginatedQuestionViewDto> {
    const response = await request(this.app.getHttpServer()).get(`/sa/quiz/questions`).query(query).auth('admin', 'qwerty').expect(HttpStatus.OK);

    return response.body;
  }

  async createQuestion(createModel: QuestionCreateDto, statusCode: number = HttpStatus.CREATED): Promise<QuestionViewDto> {
    const response = await request(this.app.getHttpServer()).post(`/sa/quiz/questions`).send(createModel).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }

  async createSeveralQuestions(count: number): Promise<QuestionViewDto[]> {
    const questionsPromises = [] as Promise<QuestionViewDto>[];

    for (let i = 0; i < count; ++i) {
      await delay(100);
      const response = this.createQuestion({
        body: `body with index ${i}`,
        correctAnswers: [`correctAnswer${i}`],
      });

      questionsPromises.push(response);
    }

    return Promise.all(questionsPromises);
  }

  async createAndPublishSeveralQuestions(count: number): Promise<QuestionViewDto[]> {
    const createdQuestions = await this.createSeveralQuestions(count);
  
    await Promise.all(
      createdQuestions.map(async (question) => {
        await this.publishQuestion(question.id, { published: true });
      })
    );
  
    return createdQuestions;
  }
  
  async updateQuestion(questionId: string, updateModel: QuestionUpdateDto, statusCode: number = HttpStatus.NO_CONTENT): Promise<void> {
    const response = await request(this.app.getHttpServer()).put(`/sa/quiz/questions/${questionId}`).send(updateModel).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }

  async deleteQuestion(questionId: string, statusCode: number = HttpStatus.NO_CONTENT): Promise<void> {
    const response = await request(this.app.getHttpServer()).delete(`/sa/quiz/questions/${questionId}`).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }

  async publishQuestion(questionId: string, publishModel: QuestionPublishDto | any, statusCode: number = HttpStatus.NO_CONTENT): Promise<void> {
    const response = await request(this.app.getHttpServer()).put(`/sa/quiz/questions/${questionId}/publish`).send(publishModel).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }
}
