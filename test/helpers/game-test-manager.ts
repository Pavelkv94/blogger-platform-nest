import { HttpStatus, INestApplication } from '@nestjs/common';
import { GameViewDto } from 'src/features/quiz/pairGame/dto/game-view.dto';
import request from 'supertest';

export class GameTestManager {
  constructor(private readonly app: INestApplication) {}

  async connectToGamePair(token: string): Promise<GameViewDto> {
    const response = await request(this.app.getHttpServer()).post(`/pair-game-quiz/pairs/connection`).auth(token, { type: 'bearer' }).expect(HttpStatus.OK);

    return response.body;
  }

  async getMyCurrentGame(token: string): Promise<GameViewDto> {
    const response = await request(this.app.getHttpServer()).get(`/pair-game-quiz/pairs/my-current`).auth(token, { type: 'bearer' }).expect(HttpStatus.OK);

    return response.body;
  }
}
