import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { UsersTestManager } from './helpers/users-test-manager';
import { mockCreateUserBody } from './mock/mock-data';
import { MeViewDto } from 'src/features/user-accounts/dto/users/user-view.dto';
import { EmailService } from 'src/features/notifications/email.service';

describe('auth', () => {
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

  it('user should login', async () => {
    await userTestManger.createUser(mockCreateUserBody);
    const token = await userTestManger.login(mockCreateUserBody.login, mockCreateUserBody.password);
    expect(token).toBeDefined();
    const token2 = await userTestManger.login(mockCreateUserBody.email, mockCreateUserBody.password);
    expect(token2).toBeDefined();
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
  //   console.log("tokens", tokens);
  //   await delay(2000);
  //   await userTestManger.me(tokens[0].accessToken, HttpStatus.UNAUTHORIZED);
  // });

  it(`should register user without really send email`, async () => {
    await userTestManger.registration(
      mockCreateUserBody,
      HttpStatus.NO_CONTENT,
    );
  });

  it(`should call email sending method while registration`, async () => {
    const sendEmailMethod = (app.get(EmailService).sendConfirmationEmail = jest.fn().mockImplementation(() => Promise.resolve()));

    await userTestManger.registration(
      mockCreateUserBody,
      HttpStatus.NO_CONTENT,
    );

    expect(sendEmailMethod).toHaveBeenCalled();
  });
});
