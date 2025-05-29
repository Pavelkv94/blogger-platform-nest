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

    const questions = await questionsTestManager.createSeveralQuestions(10);
    await questionsTestManager.publishQuestion(questions[0].id, { published: true });
    await questionsTestManager.publishQuestion(questions[1].id, { published: true });
    await questionsTestManager.publishQuestion(questions[2].id, { published: true });
    await questionsTestManager.publishQuestion(questions[3].id, { published: true });
    await questionsTestManager.publishQuestion(questions[4].id, { published: true });
    await questionsTestManager.publishQuestion(questions[5].id, { published: true });
    await questionsTestManager.publishQuestion(questions[6].id, { published: true });
    await questionsTestManager.publishQuestion(questions[7].id, { published: true });
    await questionsTestManager.publishQuestion(questions[8].id, { published: true });
    await questionsTestManager.publishQuestion(questions[9].id, { published: true });

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
    await delay(100);
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

  it('user should get 404 if such game does not exist', async () => {
    await gameTestManager.getGameById(firstUserToken, '1', HttpStatus.NOT_FOUND);
  });

  it('user should get 404 with incorrect game id', async () => {
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
    await gameTestManager.answerOnQuestion(secondUserToken, answers[1]);
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


  it('Test game flow', async () => {
    await gameTestManager.connectToGamePair(secondUserToken);
    await delay(100);
    await gameTestManager.getMyCurrentGame(secondUserToken);
    await gameTestManager.connectToGamePair(firstUserToken);
    await gameTestManager.getMyCurrentGame(firstUserToken);
    const gameResponse = await gameTestManager.getMyCurrentGame(secondUserToken);

    const questionsIndexes = gameResponse.questions.map(q => q.body[q.body.length - 1]);
    const answers = questionsIndexes.map(i => `correctAnswer${i}`);

    await gameTestManager.answerOnQuestion(firstUserToken, answers[0]);
    const gameResponse2 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse2.status).toBe(GameStatus.Active);
    expect(gameResponse2.finishGameDate).toBeNull();
    expect(gameResponse2.firstPlayerProgress.score).toBe(0);
    expect(gameResponse2.firstPlayerProgress.answers.length).toBe(0);
    expect(gameResponse2.secondPlayerProgress.score).toBe(1);
    expect(gameResponse2.secondPlayerProgress.answers.length).toBe(1);
    expect(gameResponse2.secondPlayerProgress.answers[0].answerStatus).toBe(AnswerStatus.Correct);

    await gameTestManager.answerOnQuestion(firstUserToken, answers[1]);
    const gameResponse3 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse3.status).toBe(GameStatus.Active);
    expect(gameResponse3.finishGameDate).toBeNull();
    expect(gameResponse3.firstPlayerProgress.score).toBe(0);
    expect(gameResponse3.firstPlayerProgress.answers.length).toBe(0);
    expect(gameResponse3.secondPlayerProgress.score).toBe(2);
    expect(gameResponse3.secondPlayerProgress.answers.length).toBe(2);
    expect(gameResponse3.secondPlayerProgress.answers[1].answerStatus).toBe(AnswerStatus.Correct);

    await gameTestManager.answerOnQuestion(secondUserToken, answers[0]);
    const gameResponse4 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse4.status).toBe(GameStatus.Active);
    expect(gameResponse4.finishGameDate).toBeNull();
    expect(gameResponse4.firstPlayerProgress.score).toBe(1);
    expect(gameResponse4.firstPlayerProgress.answers.length).toBe(1);
    expect(gameResponse4.firstPlayerProgress.answers[0].answerStatus).toBe(AnswerStatus.Correct);
    expect(gameResponse4.secondPlayerProgress.score).toBe(2);
    expect(gameResponse4.secondPlayerProgress.answers.length).toBe(2);

    await gameTestManager.answerOnQuestion(secondUserToken, answers[1]);
    const gameResponse5 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse5.status).toBe(GameStatus.Active);
    expect(gameResponse5.finishGameDate).toBeNull();
    expect(gameResponse5.firstPlayerProgress.score).toBe(2);
    expect(gameResponse5.firstPlayerProgress.answers.length).toBe(2);
    expect(gameResponse5.firstPlayerProgress.answers[1].answerStatus).toBe(AnswerStatus.Correct);
    expect(gameResponse5.secondPlayerProgress.score).toBe(2);
    expect(gameResponse5.secondPlayerProgress.answers.length).toBe(2);

    await gameTestManager.answerOnQuestion(firstUserToken, "incorrect");
    const gameResponse6 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse6.status).toBe(GameStatus.Active);
    expect(gameResponse6.finishGameDate).toBeNull();
    expect(gameResponse6.firstPlayerProgress.score).toBe(2);
    expect(gameResponse6.firstPlayerProgress.answers.length).toBe(2);
    expect(gameResponse6.secondPlayerProgress.score).toBe(2);
    expect(gameResponse6.secondPlayerProgress.answers.length).toBe(3);
    expect(gameResponse6.secondPlayerProgress.answers[2].answerStatus).toBe(AnswerStatus.Incorrect);


    await gameTestManager.answerOnQuestion(firstUserToken, answers[3]);
    const gameResponse7 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse7.status).toBe(GameStatus.Active);
    expect(gameResponse7.finishGameDate).toBeNull();
    expect(gameResponse7.firstPlayerProgress.score).toBe(2);
    expect(gameResponse7.firstPlayerProgress.answers.length).toBe(2);
    expect(gameResponse7.secondPlayerProgress.score).toBe(3);
    expect(gameResponse7.secondPlayerProgress.answers.length).toBe(4);
    expect(gameResponse7.secondPlayerProgress.answers[3].answerStatus).toBe(AnswerStatus.Correct);

    await gameTestManager.answerOnQuestion(secondUserToken, answers[2]);
    const gameResponse8 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse8.status).toBe(GameStatus.Active);
    expect(gameResponse8.finishGameDate).toBeNull();
    expect(gameResponse8.firstPlayerProgress.score).toBe(3);
    expect(gameResponse8.firstPlayerProgress.answers.length).toBe(3);
    expect(gameResponse8.firstPlayerProgress.answers[2].answerStatus).toBe(AnswerStatus.Correct);
    expect(gameResponse8.secondPlayerProgress.score).toBe(3);
    expect(gameResponse8.secondPlayerProgress.answers.length).toBe(4);


    await gameTestManager.answerOnQuestion(firstUserToken, answers[4]);
    const gameResponse9 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse9.status).toBe(GameStatus.Active);
    expect(gameResponse9.finishGameDate).toBeNull();
    expect(gameResponse9.firstPlayerProgress.score).toBe(3);
    expect(gameResponse9.firstPlayerProgress.answers.length).toBe(3);
    expect(gameResponse9.secondPlayerProgress.score).toBe(4);
    expect(gameResponse9.secondPlayerProgress.answers.length).toBe(5);
    expect(gameResponse9.secondPlayerProgress.answers[4].answerStatus).toBe(AnswerStatus.Correct);


    await gameTestManager.answerOnQuestion(secondUserToken, answers[3]);
    const gameResponse10 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(gameResponse10.status).toBe(GameStatus.Active);
    expect(gameResponse10.finishGameDate).toBeNull();
    expect(gameResponse10.firstPlayerProgress.score).toBe(4);
    expect(gameResponse10.firstPlayerProgress.answers.length).toBe(4);
    expect(gameResponse10.firstPlayerProgress.answers[3].answerStatus).toBe(AnswerStatus.Correct);
    expect(gameResponse10.secondPlayerProgress.score).toBe(4);
    expect(gameResponse10.secondPlayerProgress.answers.length).toBe(5);

    await delay(100);
    await gameTestManager.answerOnQuestion(secondUserToken, answers[4]);
    await delay(100);

    const gameResponse11 = await gameTestManager.getGameById(firstUserToken, gameResponse10.id);
    const gameResponse12 = await gameTestManager.getGameById(secondUserToken, gameResponse10.id);

    expect(gameResponse11.status).toBe(GameStatus.Finished);
    expect(gameResponse11.finishGameDate).not.toBeNull();
    expect(gameResponse11.firstPlayerProgress.score).toBe(5);
    expect(gameResponse11.firstPlayerProgress.answers.length).toBe(5);
    expect(gameResponse11.secondPlayerProgress.score).toBe(5);
    expect(gameResponse11.secondPlayerProgress.answers.length).toBe(5);
    expect(gameResponse11).toEqual(gameResponse12);
  });


  it('should be corrected game body in game process', async () => {
    const response = await gameTestManager.connectToGamePair(firstUserToken);
    const response1 = await gameTestManager.getMyCurrentGame(firstUserToken);
    const response2 = await gameTestManager.getGameById(firstUserToken, response.id);
    expect(response.status).toBe(GameStatus.PendingSecondPlayer);
    expect(response1).toEqual(response2);
    expect(response1.questions).toBe(null);
    expect(response1.status).toBe(GameStatus.PendingSecondPlayer);
    await delay(100);
    await gameTestManager.connectToGamePair(secondUserToken);
    const response3 = await gameTestManager.getMyCurrentGame(secondUserToken);
    const response4 = await gameTestManager.getGameById(secondUserToken, response3.id);
    expect(response3).toEqual(response4);
    expect(response3.questions).not.toBe(null);
    expect(response3.status).toBe(GameStatus.Active);

    const questionsIndexes = response3.questions.map(q => q.body[q.body.length - 1]);
    const answers = questionsIndexes.map(i => `correctAnswer${i}`);

    for (let i = 0; i < 5; i++) {
      await gameTestManager.answerOnQuestion(firstUserToken, answers[i]);
      await delay(100);
      await gameTestManager.answerOnQuestion(secondUserToken, answers[i]);
      await delay(100);
    }
    const response5 = await gameTestManager.getGameById(firstUserToken, response3.id);
    const response6 = await gameTestManager.getGameById(secondUserToken, response3.id);
    expect(response5).toEqual(response6);
    expect(response5.status).toBe(GameStatus.Finished);
    expect(response5.finishGameDate).not.toBeNull();
    expect(response5.firstPlayerProgress.score).toBe(6);
    expect(response5.firstPlayerProgress.answers.length).toBe(5);

    //start the second game
    const response7 = await gameTestManager.connectToGamePair(firstUserToken);
    const response8 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(response7.questions).toBe(null);
    expect(response7).toEqual(response8)
    const response9 = await gameTestManager.getGameById(firstUserToken, response7.id);
    expect(response8).toEqual(response9);
    expect(response8.questions).toBe(null);
    expect(response8.status).toBe(GameStatus.PendingSecondPlayer);
    await delay(100);
    const respons13 = await gameTestManager.connectToGamePair(thirdUserToken);
    expect(respons13.questions).not.toBe(null)
    expect(respons13.status).toBe(GameStatus.Active);
    const response10 = await gameTestManager.getMyCurrentGame(thirdUserToken);
    const response11 = await gameTestManager.getGameById(thirdUserToken, response10.id);
    const response12 = await gameTestManager.getMyCurrentGame(firstUserToken);
    expect(response10).toEqual(response11);
    expect(response10).toEqual(response12);
    expect(response10.questions).not.toBe(null);
    expect(response10.status).toBe(GameStatus.Active);
  });

  it('test statistic', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(100);
    await gameTestManager.connectToGamePair(secondUserToken);
    const response3 = await gameTestManager.getMyCurrentGame(secondUserToken);
    const questionsIndexes = response3.questions.map(q => q.body[q.body.length - 1]);
    const answers = questionsIndexes.map(i => `correctAnswer${i}`);

    for (let i = 0; i < 5; i++) {
      await gameTestManager.answerOnQuestion(firstUserToken, answers[i]);
      await delay(100);
      await gameTestManager.answerOnQuestion(secondUserToken, answers[i]);
      await delay(100);
    }
    const response5 = await gameTestManager.getGameById(firstUserToken, response3.id);
    const response6 = await gameTestManager.getGameById(secondUserToken, response3.id);
    expect(response5).toEqual(response6);
    expect(response5.status).toBe(GameStatus.Finished);
    expect(response5.finishGameDate).not.toBeNull();
    expect(response5.firstPlayerProgress.score).toBe(6); // first user score
    expect(response5.firstPlayerProgress.answers.length).toBe(5);
    expect(response5.secondPlayerProgress.score).toBe(5); // second user score

    //start the second game
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(100);
    const respons13 = await gameTestManager.connectToGamePair(thirdUserToken);

    const questionsIndexesGame2 = respons13.questions.map(q => q.body[q.body.length - 1]);
    const answersGame2 = questionsIndexesGame2.map(i => `correctAnswer${i}`);

    for (let i = 0; i < 5; i++) {
      await gameTestManager.answerOnQuestion(thirdUserToken, `incorrect ${i}`);
      await delay(100);
      await gameTestManager.answerOnQuestion(firstUserToken, answersGame2[i]);
      await delay(100);

    }
    const response14 = await gameTestManager.getGameById(thirdUserToken, respons13.id);

    expect(response14.status).toBe(GameStatus.Finished);
    expect(response14.firstPlayerProgress.score).toBe(5); // first user score
    expect(response14.secondPlayerProgress.score).toBe(1); // third user score

    const statisticOfFirstuser = await gameTestManager.getMyStatistic(firstUserToken);
    expect(statisticOfFirstuser.sumScore).toBe(11);
    expect(statisticOfFirstuser.avgScores).toBe(5.5);
    expect(statisticOfFirstuser.gamesCount).toBe(2);
    expect(statisticOfFirstuser.winsCount).toBe(2);
    expect(statisticOfFirstuser.lossesCount).toBe(0);
    expect(statisticOfFirstuser.drawsCount).toBe(0);

    const statisticOfSeconduser = await gameTestManager.getMyStatistic(secondUserToken);
    expect(statisticOfSeconduser.sumScore).toBe(5);
    expect(statisticOfSeconduser.avgScores).toBe(5);
    expect(statisticOfSeconduser.gamesCount).toBe(1);
    expect(statisticOfSeconduser.winsCount).toBe(0);
    expect(statisticOfSeconduser.lossesCount).toBe(1);
    expect(statisticOfSeconduser.drawsCount).toBe(0);

    const statisticOfThirduser = await gameTestManager.getMyStatistic(thirdUserToken);
    expect(statisticOfThirduser.sumScore).toBe(1);
    expect(statisticOfThirduser.avgScores).toBe(1);
    expect(statisticOfThirduser.gamesCount).toBe(1);
    expect(statisticOfThirduser.winsCount).toBe(0);
    expect(statisticOfThirduser.lossesCount).toBe(1);
    expect(statisticOfThirduser.drawsCount).toBe(0);
  });

  it('test history', async () => {
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(100);
    await gameTestManager.connectToGamePair(secondUserToken);
    const response3 = await gameTestManager.getMyCurrentGame(secondUserToken);
    const questionsIndexes = response3.questions.map(q => q.body[q.body.length - 1]);
    const answers = questionsIndexes.map(i => `correctAnswer${i}`);

    for (let i = 0; i < 5; i++) {
      await gameTestManager.answerOnQuestion(firstUserToken, answers[i]);
      await delay(100);
      await gameTestManager.answerOnQuestion(secondUserToken, answers[i]);
      await delay(100);
    }
    const response5 = await gameTestManager.getGameById(firstUserToken, response3.id);
    const response6 = await gameTestManager.getGameById(secondUserToken, response3.id);
    expect(response5).toEqual(response6);
    expect(response5.status).toBe(GameStatus.Finished);
    expect(response5.finishGameDate).not.toBeNull();
    expect(response5.firstPlayerProgress.score).toBe(6); // first user score
    expect(response5.firstPlayerProgress.answers.length).toBe(5);
    expect(response5.secondPlayerProgress.score).toBe(5); // second user score

    //start the second game
    await gameTestManager.connectToGamePair(firstUserToken);
    await delay(100);
    const respons13 = await gameTestManager.connectToGamePair(thirdUserToken);

    const questionsIndexesGame2 = respons13.questions.map(q => q.body[q.body.length - 1]);
    const answersGame2 = questionsIndexesGame2.map(i => `correctAnswer${i}`);

    for (let i = 0; i < 5; i++) {
      await gameTestManager.answerOnQuestion(thirdUserToken, `incorrect ${i}`);
      await delay(100);
      await gameTestManager.answerOnQuestion(firstUserToken, answersGame2[i]);
      await delay(100);

    }
    const response14 = await gameTestManager.getGameById(thirdUserToken, respons13.id);

    expect(response14.status).toBe(GameStatus.Finished);
    expect(response14.firstPlayerProgress.score).toBe(5); // first user score
    expect(response14.secondPlayerProgress.score).toBe(1); // third user score

    const statisticOfFirstuser = await gameTestManager.getMyStatistic(firstUserToken);
    expect(statisticOfFirstuser.sumScore).toBe(11);
    expect(statisticOfFirstuser.avgScores).toBe(5.5);
    expect(statisticOfFirstuser.gamesCount).toBe(2);
    expect(statisticOfFirstuser.winsCount).toBe(2);
    expect(statisticOfFirstuser.lossesCount).toBe(0);
    expect(statisticOfFirstuser.drawsCount).toBe(0);

    const statisticOfSeconduser = await gameTestManager.getMyStatistic(secondUserToken);
    expect(statisticOfSeconduser.sumScore).toBe(5);
    expect(statisticOfSeconduser.avgScores).toBe(5);
    expect(statisticOfSeconduser.gamesCount).toBe(1);
    expect(statisticOfSeconduser.winsCount).toBe(0);
    expect(statisticOfSeconduser.lossesCount).toBe(1);
    expect(statisticOfSeconduser.drawsCount).toBe(0);

    const statisticOfThirduser = await gameTestManager.getMyStatistic(thirdUserToken);
    expect(statisticOfThirduser.sumScore).toBe(1);
    expect(statisticOfThirduser.avgScores).toBe(1);
    expect(statisticOfThirduser.gamesCount).toBe(1);
    expect(statisticOfThirduser.winsCount).toBe(0);
    expect(statisticOfThirduser.lossesCount).toBe(1);
    expect(statisticOfThirduser.drawsCount).toBe(0);

    const games = await gameTestManager.getMyGames(firstUserToken);
    expect(games.items.length).toBe(2);

  });

});
