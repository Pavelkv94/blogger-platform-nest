import { INestApplication, HttpStatus } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { QuestionsTestManager } from './helpers/questions-test-manager';
import { UsersTestManager } from './helpers/users-test-manager';
import { GameTestManager } from './helpers/game-test-manager';
import { GameStatus } from '../src/features/quiz/pairGame/dto/game-status';
import { delay } from './helpers/delay';

describe('quiz game', () => {
  let app: INestApplication;
  let questionsTestManager: QuestionsTestManager;
  let userTestManger: UsersTestManager;
  let gameTestManager: GameTestManager;
  let firstUserToken: string;
  let secondUserToken: string;
  let firstUser: any;
  let secondUser: any;

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
    userTestManger = result.userTestManger;
    gameTestManager = result.gameTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    const password = '123456789';
    const users = await userTestManger.createSeveralUsers(2);
    firstUser = users[0];
    secondUser = users[1];

    const token1 = await userTestManger.login('test0', password);
    const token2 = await userTestManger.login('test1', password);
    firstUserToken = token1.accessToken;
    secondUserToken = token2.accessToken;

    await questionsTestManager.createSeveralQuestions(10);
  });

  it('user should connect to game pair, when game pairs are not exist', async () => {
    const gameResponse = await gameTestManager.connectToGamePair(firstUserToken);
    expect(gameResponse).toEqual({
      finishGameDate: null,
      id: expect.any(String),
      pairCreatedDate: expect.any(String),
      secondPlayerProgress: null,
      startGameDate: null,
      status: GameStatus.PendingSecondPlayer,
      firstPlayerProgress: {
        player: {
          id: expect.any(String),
          login: firstUser.login,
        },
        score: 0,
        answers: null,
      },
    });
  });

  it('user should connect to existing game pair', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);

    await delay(1000);

    const gameResponse2 = await gameTestManager.connectToGamePair(secondUserToken);

    expect(gameResponse2).toEqual({
      finishGameDate: null,
      id: expect.any(String),
      pairCreatedDate: expect.any(String),
      secondPlayerProgress: {
        player: {
          id: expect.any(String),
          login: secondUser.login,
        },
        score: 0,
        answers: [],
      },
      startGameDate: expect.any(String),
      status: GameStatus.Active,
      firstPlayerProgress: {
        player: {
          id: expect.any(String),
          login: firstUser.login,
        },
        score: 0,
        answers: [],
      },
      questions: expect.any(Array),
    });

    expect(gameResponse2.questions.length).toBe(5);
  });

  it('user should get his current game', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);

    const myCurrentGameResponse = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(myCurrentGameResponse).toEqual({
      secondPlayerProgress: null,
      questions: null,
      id: expect.any(String),
      status: GameStatus.PendingSecondPlayer,
      pairCreatedDate: expect.any(String),
      startGameDate: null,
      finishGameDate: null,
      firstPlayerProgress: { player: { id: expect.any(String), login: firstUser.login }, score: 0, answers: [] },
    });
  });

  it('user should get 404 when game not found', async () => {
    await gameTestManager.getMyCurrentGame(firstUserToken, HttpStatus.NOT_FOUND);
  });

  it('user should answer on the firstquestion', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(1000);
    await gameTestManager.connectToGamePair(secondUserToken);

    
  });
});
