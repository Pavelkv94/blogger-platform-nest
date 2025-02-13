import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateUserDto } from '../../src/features/user-accounts/dto/users/create-user.dto';
import { MeViewDto, BaseUserViewDto } from '../../src/features/user-accounts/dto/users/user-view.dto';
import request from 'supertest';
import { delay } from './delay';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';

export class UsersTestManager {
  constructor(private app: INestApplication) {}

  async getUsers(query: string): Promise<PaginatedViewDto<BaseUserViewDto>> {
    const response = await request(this.app.getHttpServer()).get(`/sa/users${query}`).auth('admin', 'qwerty').expect(200);

    return response.body;
  }

  async createUser(createModel: CreateUserDto, statusCode: number = HttpStatus.CREATED): Promise<BaseUserViewDto> {
    const response = await request(this.app.getHttpServer()).post(`/sa/users`).send(createModel).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }

  async deleteUser(userId: string, statusCode: number = HttpStatus.NO_CONTENT): Promise<BaseUserViewDto> {
    const response = await request(this.app.getHttpServer()).delete(`/sa/users/${userId}`).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }

  async login(loginOrEmail: string, password: string, statusCode: number = HttpStatus.OK): Promise<{ accessToken: string }> {
    const response = await request(this.app.getHttpServer()).post(`/auth/login`).send({ loginOrEmail, password }).expect(statusCode);

    return {
      accessToken: response.body.accessToken,
    };
  }

  async loginWithAgent(loginOrEmail: string, password: string, agent: string, statusCode: number = HttpStatus.OK): Promise<any> {
    const response = await request(this.app.getHttpServer()).post(`/auth/login`).set("User-Agent", agent).send({ loginOrEmail, password }).expect(statusCode);

    return response
  }

  async registration(createModel: CreateUserDto, statusCode: number = HttpStatus.CREATED): Promise<void> {
    await request(this.app.getHttpServer()).post(`/auth/registration`).send(createModel).expect(statusCode);
  }

  async me(accessToken: string, statusCode: number = HttpStatus.OK): Promise<MeViewDto> {
    const response = await request(this.app.getHttpServer()).get(`/auth/me`).auth(accessToken, { type: 'bearer' }).expect(statusCode);

    return response.body;
  }

  async createSeveralUsers(count: number): Promise<BaseUserViewDto[]> {
    const usersPromises = [] as Promise<BaseUserViewDto>[];

    for (let i = 0; i < count; ++i) {
      await delay(100);
      const response = this.createUser({
        login: `test` + i,
        password: '123456789',
        email: `test` + i + '@test.com',
      });

      usersPromises.push(response);
    }

    return Promise.all(usersPromises);
  }

  async createAndLoginSeveralUsers(count: number): Promise<{ accessToken: string }[]> {
    const users = await this.createSeveralUsers(count);
    const loginPromises = users.map((user: BaseUserViewDto) => this.login(user.login, '123456789'));

    return await Promise.all(loginPromises);
  }
}
