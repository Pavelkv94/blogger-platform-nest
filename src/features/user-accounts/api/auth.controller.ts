import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginOuputDto } from '../dto/users/login-user.dto';
import { MeViewDto } from '../dto/users/user-view.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserJwtPayloadDto } from '../dto/users/user-jwt-payload.dto';
import { ExtractUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { RegistrationInputDto } from '../dto/users/create-user.dto';
import { NewPasswordInputDto, PasswordRecoveryInputDto, RegistrationConfirmationInputDto, ResendConfirmationInputDto } from '../dto/users/confirmation-input.dto';
import { SwaggerGet } from 'src/core/decorators/swagger/swagger-get';
import { SwaggerAuthStatus } from 'src/core/decorators/swagger/swagger-options';
import { SwaggerPostForLogin } from 'src/core/decorators/swagger/swagger-post';
import { SwaggerPostWith429 } from 'src/core/decorators/swagger/swagger-post';
import { LoginUserCommand } from '../application/usecases/users/login-user.usecase';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/usecases/users/register-user.usecase';
import { PassRecoveryCommand } from '../application/usecases/users/pass-recovery.usecase';
import { RegisterConfirmCommand } from '../application/usecases/users/register-confirm.usecase';
import { ResendEmailCommand } from '../application/usecases/users/resend-email.usecase';
import { SetNewPassCommand } from '../application/usecases/users/set-new-pass.usecase';
import { Response, Request } from 'express';
import { JwtAuthPassportGuard } from 'src/core/guards/passport/jwt-auth-passport.guard';
import { UsersQueryRepository } from '../infrastructure/users/users.query-repository';
import { randomUUID } from 'crypto';
import { RefreshTokenCommand } from '../application/usecases/users/refresh-token.usecase';
import { JwtRefreshAuthPassportGuard } from 'src/core/guards/passport/jwt-refresh-passport.guard';
import { DeleteSecurityDeviceCommand } from '../application/usecases/security-devices/delete-device.usecase';
import { ThrottlerGuard } from '@nestjs/throttler';
// import { LocalAuthPasportGuard } from './guards/passport/local-auth-passport.guard';

@ApiTags('Auth') //swagger
@Controller('auth')
export class AuthController {
  constructor(
    @Inject() private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @SwaggerPostForLogin('Try login user to the system', LoginOuputDto)
  @Post('login')
  @UseGuards(ThrottlerGuard, LocalAuthGuard) //* порядок имеет значение
  @HttpCode(HttpStatus.OK)
  async login(@ExtractUserFromRequest() user: UserJwtPayloadDto, @Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<LoginOuputDto> {

    const loginDto = {
      userId: user.userId,
      device_id: randomUUID(),
      ip: request.ip || '',
      userAgent: request.headers['user-agent'] || '',
    };

    const { accessToken, refreshToken } = await this.commandBus.execute<LoginUserCommand, { accessToken: string; refreshToken: string }>(new LoginUserCommand(loginDto));

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // Use secure cookies in production
      // maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      // sameSite: 'lax', // or 'strict' based on your requirements
    });

    return { accessToken };
  }

  @SwaggerPostWith429('Register new user')
  @UseGuards(ThrottlerGuard)
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: RegistrationInputDto): Promise<void> {
    return await this.commandBus.execute<RegisterUserCommand, void>(new RegisterUserCommand(body));
  }

  @SwaggerPostWith429('Confirm registration of new user')
  @UseGuards(ThrottlerGuard)
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: RegistrationConfirmationInputDto): Promise<void> {
    return await this.commandBus.execute<RegisterConfirmCommand, void>(new RegisterConfirmCommand(body.code));
  }

  @SwaggerPostWith429('Resend confirmation email')
  @UseGuards(ThrottlerGuard)
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: ResendConfirmationInputDto): Promise<void> {
    return await this.commandBus.execute<ResendEmailCommand, void>(new ResendEmailCommand(body.email));
  }

  @SwaggerPostWith429('Password recovery')
  @UseGuards(ThrottlerGuard)
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveryInputDto): Promise<void> {
    return await this.commandBus.execute<PassRecoveryCommand, void>(new PassRecoveryCommand(body.email));
  }

  @SwaggerPostWith429('Set new password')
  @UseGuards(ThrottlerGuard)
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordInputDto): Promise<void> {
    return await this.commandBus.execute<SetNewPassCommand, void>(new SetNewPassCommand(body.code, body.newPassword));
  }

  // @SwaggerPostForLogin('Generate new pair of access and refresh tokens', LoginOuputDto)
  @Post('refresh-token')
  @UseGuards(JwtRefreshAuthPassportGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(@ExtractUserFromRequest() user: UserJwtPayloadDto, @Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<LoginOuputDto> {
    const refreshDto = {
      userId: user.userId,
      device_id: user.deviceId,
      ip: request.ip || '',
      userAgent: request.headers['user-agent'] || '',
    };

    const { accessToken, refreshToken } = await this.commandBus.execute<RefreshTokenCommand, { accessToken: string; refreshToken: string }>(new RefreshTokenCommand(refreshDto));

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // Use secure cookies in production
      // maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      // sameSite: 'lax', // or 'strict' based on your requirements
    });

    return { accessToken };
  }

  @Post('logout')
  @UseGuards(JwtRefreshAuthPassportGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<void> {
    await this.commandBus.execute<DeleteSecurityDeviceCommand, void>(new DeleteSecurityDeviceCommand(user.userId, user.deviceId));
  }

  @SwaggerGet('Get information about current user', MeViewDto, SwaggerAuthStatus.WithAuth)
  @Get('me')
  @UseGuards(JwtAuthPassportGuard)
  async getMe(@ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<MeViewDto> {
    const currentUser = await this.usersQueryRepository.findMeByIdOrNotFound(user.userId);

    return currentUser;
  }
}
