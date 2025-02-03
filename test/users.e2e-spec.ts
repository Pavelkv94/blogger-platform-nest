import { INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { UsersTestManager } from './helpers/users-test-manager';
import { mockCreateUserBody } from './mock/mock-data';
import { DataSource } from 'typeorm';
import { MeViewDto } from 'src/features/user-accounts/dto/users/user-view.dto';

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
    userTestManger = result.userTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should create user', async () => {
    const response = await userTestManger.createUser(mockCreateUserBody);

    expect(response).toEqual({
      login: mockCreateUserBody.login,
      email: mockCreateUserBody.email,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('should create user and emailConfirmation and recoveryConfirmation', async () => {
    await userTestManger.createUser(mockCreateUserBody);

    const dataSourse = await app.resolve(DataSource);
    const emailConfirmations = await dataSourse.query(`SELECT * FROM email_confirmation`);
    expect(emailConfirmations).toHaveLength(1);
    expect(emailConfirmations[0].confirmationCode).toBeDefined();
    expect(emailConfirmations[0].expirationDate).toBeDefined();
    expect(emailConfirmations[0].isConfirmed).toBe(false);

    const recoveryConfirmations = await dataSourse.query(`SELECT * FROM recovery_confirmation`);
    expect(recoveryConfirmations).toHaveLength(1);
    expect(recoveryConfirmations[0].recoveryCode).toBeDefined();
    expect(recoveryConfirmations[0].recoveryExpirationDate).toBeDefined();
  });

  it('should delete user', async () => {
    const user = await userTestManger.createUser(mockCreateUserBody);

    const users = await userTestManger.getUsers('');

    expect(users.items).toHaveLength(1);

    await userTestManger.deleteUser(user.id);

    const usersAfterDelete = await userTestManger.getUsers('');

    expect(usersAfterDelete.items).toHaveLength(0);
  });

  it('should get users with paging', async () => {
    const users = await userTestManger.createSeveralUsers(12);
    const getUsersResponse = await userTestManger.getUsers('?pageNumber=2&sortDirection=asc');

    expect(users.length).toBe(12);
    expect(getUsersResponse.totalCount).toBe(12);
    expect(getUsersResponse.items).toHaveLength(2);
    expect(getUsersResponse.pagesCount).toBe(2);
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

  // it(`shouldn't return users info while "me" request if accessTokens expired`, async () => {
  //   const tokens = await userTestManger.createAndLoginSeveralUsers(1);
  //   await delay(2000);
  //   await userTestManger.me(tokens[0].accessToken, HttpStatus.UNAUTHORIZED);
  // });

  // it(`should register user without really send email`, async () => {
  //   await userTestManger.registration(
  //     {
  //       email: 'email@email.em',
  //       password: '123123123',
  //       login: 'login123',
  //     } as CreateUserDto,
  //     HttpStatus.NO_CONTENT,
  //   );
  // });

  // it(`should call email sending method while registration`, async () => {
  //   const sendEmailMethod = (app.get(EmailService).sendConfirmationEmail = jest.fn().mockImplementation(() => Promise.resolve()));

  //   await userTestManger.registration(
  //     {
  //       email: 'email@email.em',
  //       password: '123123123',
  //       login: 'login123',
  //     } as CreateUserDto,
  //     HttpStatus.NO_CONTENT,
  //   );

  //   expect(sendEmailMethod).toHaveBeenCalled();
  // });
});
