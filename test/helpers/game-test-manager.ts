import { HttpStatus, INestApplication } from '@nestjs/common';
import { GameViewDto } from 'src/features/quiz/pairGame/dto/game-view.dto';
import request from 'supertest';

export class GameTestManager {
  constructor(private readonly app: INestApplication) {}

  async connectToGamePair(token: string, status: HttpStatus = HttpStatus.OK): Promise<GameViewDto> {
    const response = await request(this.app.getHttpServer()).post(`/pair-game-quiz/pairs/connection`).auth(token, { type: 'bearer' }).expect(status);

    return response.body;
  }

  async getMyCurrentGame(token: string, status: HttpStatus = HttpStatus.OK): Promise<GameViewDto> {
    const response = await request(this.app.getHttpServer()).get(`/pair-game-quiz/pairs/my-current`).auth(token, { type: 'bearer' }).expect(status);

    return response.body;
  }

  async getGameById(token: string, id: string, status: HttpStatus = HttpStatus.OK): Promise<GameViewDto> {
    const response = await request(this.app.getHttpServer()).get(`/pair-game-quiz/pairs/${id}`).auth(token, { type: 'bearer' }).expect(status);

    return response.body;
  }

  async answerOnQuestion(token: string, answer: string, status: HttpStatus = HttpStatus.OK): Promise<GameViewDto> {
    const response = await request(this.app.getHttpServer()).post(`/pair-game-quiz/pairs/my-current/answers`).auth(token, { type: 'bearer' }).send({ answer }).expect(status);

    return response.body;
  }
}
