import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { UsersTestManager } from './helpers/users-test-manager';
import { CreateUserDto } from 'src/features/user-accounts/dto/create-user.dto';
import { MeViewDto } from 'src/features/user-accounts/dto/user-view.dto';
import { delay } from './helpers/delay';
import { EmailService } from 'src/features/notifications/email.service';

describe('users', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

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
    // userTestManger = result.userTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should create user', async () => {
    const body: CreateUserDto = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.em',
    };

    const response = await userTestManger.createUser(body);

    expect(response).toEqual({
      login: body.login,
      email: body.email,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('should get users with paging', async () => {
    const users = await userTestManger.createSeveralUsers(12);
    const getUsersResponse = await userTestManger.getUsers('?pageNumber=2&sortDirection=asc');

    expect(users.length).toBe(12);
    expect(getUsersResponse.totalCount).toBe(12);
    expect(getUsersResponse.items).toHaveLength(2);
    expect(getUsersResponse.pagesCount).toBe(2);
  });

  it('should delete user', async () => {
    const user = await userTestManger.createUser({
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.em',
    });

    await userTestManger.deleteUser(user.id);

    const getUsersResponse = await userTestManger.getUsers('?pageNumber=1&sortDirection=asc');

    expect(getUsersResponse.items).toHaveLength(0);
    expect(getUsersResponse.totalCount).toBe(0);
    expect(getUsersResponse.pagesCount).toBe(0);
  });

  it('should return users info while "me" request with correct accessTokens', async () => {
    const tokens = await userTestManger.createAndLoginSeveralUsers(1);

    const responseBody = await userTestManger.me(tokens[0].accessToken);

    expect(responseBody).toEqual({
      login: expect.anything(),
      userId: expect.anything(),
      email: expect.anything(),
    } as MeViewDto);
  });

  it(`shouldn't return users info while "me" request if accessTokens expired`, async () => {
    const tokens = await userTestManger.createAndLoginSeveralUsers(1);
    await delay(2000);
    await userTestManger.me(tokens[0].accessToken, HttpStatus.UNAUTHORIZED);
  });

  it(`should register user without really send email`, async () => {
    await userTestManger.registration(
      {
        email: 'email@email.em',
        password: '123123123',
        login: 'login123',
      } as CreateUserDto,
      HttpStatus.NO_CONTENT,
    );
  });

  it(`should call email sending method while registration`, async () => {
    const sendEmailMethod = (app.get(EmailService).sendConfirmationEmail = jest.fn().mockImplementation(() => Promise.resolve()));

    await userTestManger.registration(
      {
        email: 'email@email.em',
        password: '123123123',
        login: 'login123',
      } as CreateUserDto,
      HttpStatus.NO_CONTENT,
    );

    expect(sendEmailMethod).toHaveBeenCalled();
  });
});
