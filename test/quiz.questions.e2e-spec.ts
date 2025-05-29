import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { QuestionsTestManager } from './helpers/questions-test-manager';
import { getLongText, mockCreateQuestionBody, mockUpdateQuestionBody } from './mock/mock-data';
import { PublishedStatus } from 'src/features/quiz/questions/dto/questions-publishedStatus';

describe('quiz questions', () => {
  let app: INestApplication;
  let questionsTestManager: QuestionsTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: 'secret_key',
          signOptions: { expiresIn: '2s' },
        }),
      ),
    );
    app = result.app;
    questionsTestManager = result.questionsTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should create question', async () => {
    const response = await questionsTestManager.createQuestion(mockCreateQuestionBody);

    expect(response).toEqual({
      id: expect.any(String),
      body: mockCreateQuestionBody.body,
      correctAnswers: mockCreateQuestionBody.correctAnswers,
      published: false,
      createdAt: expect.any(String),
      updatedAt: null,
    });
  });

  it('should get questions', async () => {
    const response = await questionsTestManager.getQuestions();
    expect(response.items).toHaveLength(0);
    expect(response.totalCount).toBe(0);
    expect(response.pagesCount).toBe(0);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(10);
  });

  it('should get paginated questions', async () => {
    await questionsTestManager.createSeveralQuestions(12);
    const response = await questionsTestManager.getQuestions({
      pageSize: 5,
      pageNumber: 3,
    });

    expect(response.items).toHaveLength(2);
    expect(response.totalCount).toBe(12);
    expect(response.pagesCount).toBe(3);
    expect(response.page).toBe(3);
    expect(response.pageSize).toBe(5);
  });

  it('should get questions with search', async () => {
    await questionsTestManager.createSeveralQuestions(10);
    const response = await questionsTestManager.getQuestions({
      bodySearchTerm: 'body with index 1',
    });

    expect(response.items).toHaveLength(1);
    expect(response.totalCount).toBe(1);
    expect(response.pagesCount).toBe(1);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(10);
  });

  it('should get questions with published status', async () => {
    await questionsTestManager.createSeveralQuestions(10);
    const responseWithPublishedStatus = await questionsTestManager.getQuestions({
      publishedStatus: PublishedStatus.Published,
    });

    expect(responseWithPublishedStatus.items).toHaveLength(0);
    expect(responseWithPublishedStatus.totalCount).toBe(0);

    const responseWithNotPublishedStatus = await questionsTestManager.getQuestions({
      publishedStatus: PublishedStatus.NotPublished,
    });

    expect(responseWithNotPublishedStatus.items).toHaveLength(10);
    expect(responseWithNotPublishedStatus.totalCount).toBe(10);
  });

  it('should get questions with published status and search', async () => {
    await questionsTestManager.createSeveralQuestions(10);
    const responseWithPublishedStatus = await questionsTestManager.getQuestions({
      publishedStatus: PublishedStatus.Published,
      bodySearchTerm: 'body with index 1',
    });

    expect(responseWithPublishedStatus.items).toHaveLength(0);
    expect(responseWithPublishedStatus.totalCount).toBe(0);

    const responseWithNotPublishedStatus = await questionsTestManager.getQuestions({
      publishedStatus: PublishedStatus.NotPublished,
      bodySearchTerm: 'body with index 1',
    });

    expect(responseWithNotPublishedStatus.items).toHaveLength(1);
    expect(responseWithNotPublishedStatus.totalCount).toBe(1);
  });

  it('should get questions with sort', async () => {
    await questionsTestManager.createSeveralQuestions(10);
    const responseDesc = await questionsTestManager.getQuestions({
      sortBy: 'body',
      sortDirection: 'desc',
    });

    expect(responseDesc.items[0].body).toBe('body with index 9');
    expect(responseDesc.items[9].body).toBe('body with index 0');

    const responseAsc = await questionsTestManager.getQuestions({
      sortBy: 'body',
      sortDirection: 'asc',
    });

    expect(responseAsc.items[0].body).toBe('body with index 0');
    expect(responseAsc.items[9].body).toBe('body with index 9');
  });

  it('should delete question', async () => {
    const response = await questionsTestManager.createQuestion(mockCreateQuestionBody);
    const responseAfterCreate = await questionsTestManager.getQuestions();
    expect(responseAfterCreate.items).toHaveLength(1);
    expect(responseAfterCreate.totalCount).toBe(1);
    await questionsTestManager.deleteQuestion(response.id);
    const responseAfterDelete = await questionsTestManager.getQuestions();
    expect(responseAfterDelete.items).toHaveLength(0);
    expect(responseAfterDelete.totalCount).toBe(0);
  });

  it('should update question', async () => {
    const response = await questionsTestManager.createQuestion(mockCreateQuestionBody);

    await questionsTestManager.updateQuestion(response.id, mockUpdateQuestionBody);
    const responseAfterUpdate = await questionsTestManager.getQuestions();
    expect(responseAfterUpdate.items[0].body).toBe(mockUpdateQuestionBody.body);
    expect(responseAfterUpdate.items[0].correctAnswers).toEqual(mockUpdateQuestionBody.correctAnswers);
  });

  it('should publish/unpublish question', async () => {
    const response = await questionsTestManager.createQuestion(mockCreateQuestionBody);
    await questionsTestManager.publishQuestion(response.id, { published: true });
    const responseAfterPublish = await questionsTestManager.getQuestions();
    expect(responseAfterPublish.items[0].published).toBe(true);
    await questionsTestManager.publishQuestion(response.id, { published: false });
    const responseAfterUnpublish = await questionsTestManager.getQuestions();
    expect(responseAfterUnpublish.items[0].published).toBe(false);
  });

  it('should return error if passed body is incorrect; status 400', async () => {
    await questionsTestManager.createQuestion(
      {
        body: getLongText(1001),
        correctAnswers: mockCreateQuestionBody.correctAnswers,
      },
      HttpStatus.BAD_REQUEST,
    );
  });

  it('shouldnt publish question if it has incorrect body', async () => {
    const response = await questionsTestManager.createQuestion(mockCreateQuestionBody);
    await questionsTestManager.publishQuestion(response.id, { published: 'true' }, HttpStatus.BAD_REQUEST);
  });

  it('should create question and publish it', async () => {
    const response = await questionsTestManager.createQuestion(mockCreateQuestionBody);
    await questionsTestManager.publishQuestion(response.id, { published: true });
    const responseAfterPublish = await questionsTestManager.getQuestions();
    expect(responseAfterPublish.items[0].published).toBe(true);
    await questionsTestManager.createQuestion(mockCreateQuestionBody);
    const response2 = await questionsTestManager.getQuestions();
    expect(response2.items.length).toBe(2);
  });

  it('should return 404 if question not found when delete', async () => {
    await questionsTestManager.deleteQuestion('123', HttpStatus.NOT_FOUND);
  });
});
