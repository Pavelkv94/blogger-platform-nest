import { INestApplication, HttpStatus } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { QuestionsTestManager } from './helpers/questions-test-manager';
import { UsersTestManager } from './helpers/users-test-manager';
import { GameTestManager } from './helpers/game-test-manager';
import { GameStatus } from '../src/features/quiz/pairGame/dto/game-status';
import { delay } from './helpers/delay';
import { AnswerStatus } from 'src/features/quiz/pairGame/dto/answer-status';

describe('quiz game', () => {
  let app: INestApplication;
  let questionsTestManager: QuestionsTestManager;
  let userTestManger: UsersTestManager;
  let gameTestManager: GameTestManager;
  let firstUserToken: string;
  let secondUserToken: string;
  let thirdUserToken: string;
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
    const users = await userTestManger.createSeveralUsers(3);
    firstUser = users[0];
    secondUser = users[1];

    const token1 = await userTestManger.login('test0', password);
    const token2 = await userTestManger.login('test1', password);
    const token3 = await userTestManger.login('test2', password);
    firstUserToken = token1.accessToken;
    secondUserToken = token2.accessToken;
    thirdUserToken = token3.accessToken;

    await questionsTestManager.createSeveralQuestions(10);
  });

  it('user should connect to game pair, when availablegame pairs are not exist', async () => {
    const gameResponse = await gameTestManager.connectToGamePair(firstUserToken);

    expect(gameResponse).toEqual({
      finishGameDate: null,
      id: expect.any(String),
      pairCreatedDate: expect.any(String),
      secondPlayerProgress: null,
      startGameDate: null,
      status: GameStatus.PendingSecondPlayer,
      questions: null,
      firstPlayerProgress: {
        player: {
          id: expect.any(String),
          login: firstUser.login,
        },
        score: 0,
        answers: [],
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
    await gameTestManager.connectToGamePair(secondUserToken);
    await gameTestManager.getMyCurrentGame(firstUserToken, HttpStatus.NOT_FOUND);
  });

  it('user should get 404 when game finished', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(1000);
    await gameTestManager.connectToGamePair(secondUserToken);
    for (let i = 0; i < 5; i++) {
      await gameTestManager.answerOnQuestion(firstUserToken, `incorrect ${i}`);
      await delay(100);
      await gameTestManager.answerOnQuestion(secondUserToken, `incorrect ${i}`);
      await delay(100);
    }
    await gameTestManager.getMyCurrentGame(firstUserToken, HttpStatus.NOT_FOUND);
  });

  it('user should get game by game id', async () => {
    const gameResponse = await gameTestManager.connectToGamePair(firstUserToken);
    const gameByIdResponse = await gameTestManager.getGameById(firstUserToken, gameResponse.id);

    expect(gameByIdResponse).toEqual(gameResponse);
  });

  it('user should get 400 with incorrect game id', async () => {
    await gameTestManager.getGameById(firstUserToken, 'incorrect_id_format', HttpStatus.BAD_REQUEST);
  });

  it('user should get 403 when hi try to get game of another user', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(1000);
    const gameResponse = await gameTestManager.connectToGamePair(secondUserToken);
    await gameTestManager.getGameById(firstUserToken, gameResponse.id);
    await gameTestManager.connectToGamePair(thirdUserToken);
    await gameTestManager.getGameById(thirdUserToken, gameResponse.id, HttpStatus.FORBIDDEN);
  });

  it('should return 403 when user tries to get game in which they are not a participant', async () => {
    const gameResponse = await gameTestManager.connectToGamePair(firstUserToken);
    console.log(gameResponse);
    await gameTestManager.getGameById(secondUserToken, gameResponse.id, HttpStatus.FORBIDDEN);
  });


  it('user should answer on the first question', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(1000);
    await gameTestManager.connectToGamePair(secondUserToken);
    const answerResponse = await gameTestManager.answerOnQuestion(firstUserToken, 'incorrect');

    expect(answerResponse).toEqual({
      answerStatus: AnswerStatus.Incorrect,
      questionId: expect.any(Number),
      addedAt: expect.any(String),
    });
  });

  it('user should get 403 when he tries to answer and he is not in active game', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);
    await gameTestManager.answerOnQuestion(firstUserToken, 'incorrect', HttpStatus.FORBIDDEN);
  });

  it('user should get 403 when he tries to answer more than 5 times', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(1000);
    await gameTestManager.connectToGamePair(secondUserToken);
    for (let i = 0; i < 5; i++) {
      await gameTestManager.answerOnQuestion(firstUserToken, `incorrect ${i}`);
      await delay(100);
    }
    await gameTestManager.answerOnQuestion(firstUserToken, 'incorrect', HttpStatus.FORBIDDEN);
  });

  it('Should return new created active game', async () => {
    const gameResponse = await gameTestManager.connectToGamePair(firstUserToken);
    await delay(1000);
    await gameTestManager.connectToGamePair(secondUserToken);

    const gameResponse2 = await gameTestManager.getMyCurrentGame(firstUserToken);
    const gameResponse3 = await gameTestManager.getGameById(firstUserToken, gameResponse.id);
    expect(gameResponse2.id).toEqual(gameResponse.id);
    expect(gameResponse3.id).toEqual(gameResponse.id);
  });

  it('Should return started game by user 1 and second user', async () => {
    const gameResponse = await gameTestManager.connectToGamePair(firstUserToken);
    await delay(1000);
    await gameTestManager.connectToGamePair(secondUserToken);
    await delay(500);
    const gameResponse2 = await gameTestManager.getMyCurrentGame(firstUserToken);
    const gameResponse3 = await gameTestManager.getGameById(firstUserToken, gameResponse.id);
    console.log(gameResponse2);
    console.log(gameResponse3);
    expect(gameResponse2.id).toEqual(gameResponse.id);
    expect(gameResponse3.id).toEqual(gameResponse.id);
  });

  it('Should return 403 when user tries to connect to game pair when he is already in game', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(1000);
    const gameResponse2 = await gameTestManager.getMyCurrentGame(firstUserToken);
    await gameTestManager.connectToGamePair(firstUserToken, HttpStatus.FORBIDDEN);
    await delay(1000);
    const gameResponse4 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse2.id).toEqual(gameResponse4.id);
  });

  it('Should be correct answers flow', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(1000);
    await gameTestManager.connectToGamePair(secondUserToken);
    const gameResponse = await gameTestManager.getMyCurrentGame(firstUserToken);
    const questionsIndexes = gameResponse.questions.map(q => q.body[q.body.length - 1]);
    const answers = questionsIndexes.map(i => `correctAnswer${i}`);
    await gameTestManager.answerOnQuestion(firstUserToken, answers[0]);
    const gameResponse2 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse2.firstPlayerProgress.score).toBe(1)
    expect(gameResponse2.secondPlayerProgress.score).toBe(0)

    await delay(100);
    await gameTestManager.answerOnQuestion(secondUserToken, "Incorrect");
    const gameResponse3 = await gameTestManager.getMyCurrentGame(secondUserToken);
    expect(gameResponse3.firstPlayerProgress.score).toBe(1)
    expect(gameResponse3.secondPlayerProgress.score).toBe(0)

    await delay(100);
    await gameTestManager.answerOnQuestion(secondUserToken, answers[0]);
    const gameResponseFirstUser4 = await gameTestManager.getMyCurrentGame(firstUserToken);
    const gameResponseSecondUser4 = await gameTestManager.getMyCurrentGame(secondUserToken);
    expect(gameResponseSecondUser4.firstPlayerProgress.score).toBe(1)
    expect(gameResponseSecondUser4.secondPlayerProgress.score).toBe(1)
    expect(gameResponseFirstUser4.firstPlayerProgress.score).toBe(1)
    expect(gameResponseFirstUser4.secondPlayerProgress.score).toBe(1)
  });


  it('Should test my-current game', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);
    const gameResponse = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse.questions).toBe(null);
    expect(gameResponse.status).toBe(GameStatus.PendingSecondPlayer);

    await delay(100);
    await gameTestManager.connectToGamePair(secondUserToken);
    const gameResponse2 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse2.questions.length).toBe(5);
    expect(gameResponse2.status).toBe(GameStatus.Active);
    const questionsIndexes = gameResponse2.questions.map(q => q.body[q.body.length - 1]);
    const answers = questionsIndexes.map(i => `correctAnswer${i}`);

    for (let i = 0; i < 5; i++) {
      await gameTestManager.answerOnQuestion(firstUserToken, answers[i]);
      await delay(100);
      await gameTestManager.answerOnQuestion(secondUserToken, `incorrect ${i}`);
      await delay(100);
    }
    await gameTestManager.getMyCurrentGame(firstUserToken, HttpStatus.NOT_FOUND);
    const gameResponse3 = await gameTestManager.getGameById(firstUserToken, gameResponse.id);
    expect(gameResponse3.status).toBe(GameStatus.Finished);
  });


  it('Test the second game after the first game is finished', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(100);
    await gameTestManager.connectToGamePair(secondUserToken);
    const gameResponse = await gameTestManager.getMyCurrentGame(firstUserToken);
    const questionsIndexes = gameResponse.questions.map(q => q.body[q.body.length - 1]);
    const answers = questionsIndexes.map(i => `correctAnswer${i}`);

    for (let i = 0; i < 5; i++) {
      await gameTestManager.answerOnQuestion(firstUserToken, answers[i]);
      await delay(100);
      await gameTestManager.answerOnQuestion(secondUserToken, `incorrect ${i}`);
      await delay(100);
    }
    await gameTestManager.getMyCurrentGame(firstUserToken, HttpStatus.NOT_FOUND);
    const gameResponse3 = await gameTestManager.getGameById(firstUserToken, gameResponse.id);
    expect(gameResponse3.status).toBe(GameStatus.Finished);

    // finished rhe first game and start the second
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(100);
    await gameTestManager.getMyCurrentGame(firstUserToken);
    await gameTestManager.getMyCurrentGame(secondUserToken, HttpStatus.NOT_FOUND);
    await gameTestManager.connectToGamePair(secondUserToken);
    await delay(100);
    await gameTestManager.getMyCurrentGame(secondUserToken);

  });


  // it('Test', async () => {
  //   await gameTestManager.connectToGamePair(firstUserToken);
  //   await delay(100);
  //   await gameTestManager.getMyCurrentGame(firstUserToken);
  //   await gameTestManager.connectToGamePair(secondUserToken);
  //   await gameTestManager.getMyCurrentGame(firstUserToken);
  // });

});
