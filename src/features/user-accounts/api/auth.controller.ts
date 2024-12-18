import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginOuputDto } from '../dto/login-user.dto';
import { AuthService } from '../application/auth.service';
import { MeViewDto } from '../dto/user-view.dto';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { UserJwtPayloadDto } from '../dto/user-jwt-payload.dto';
import { ExtractUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { RegistrationInputDto } from '../dto/create-user.dto';
import { NewPasswordInputDto, PasswordRecoveryInputDto, RegistrationConfirmationInputDto, ResendConfirmationInputDto } from '../dto/confirmation-input.dto';
import { SwaggerGet } from 'src/core/decorators/swagger/swagger-get';
import { SwaggerAuthStatus } from 'src/core/decorators/swagger/swagger-options';
import { SwaggerPostForLogin } from 'src/core/decorators/swagger/swagger-post';
import { SwaggerPostWith429 } from 'src/core/decorators/swagger/swagger-post';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/usecases/register-user.usecase';
import { PassRecoveryCommand } from '../application/usecases/pass-recovery.usecase';
import { RegisterConfirmCommand } from '../application/usecases/register-confirm.usecase';
import { ResendEmailCommand } from '../application/usecases/resend-email.usecase';
import { SetNewPassCommand } from '../application/usecases/set-new-pass.usecase';
import { Response } from 'express';

@ApiTags('Auth') //swagger
@Controller('auth')
export class AuthController {
  constructor(
    @Inject() private readonly authService: AuthService,
    @Inject() private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @SwaggerPostForLogin('Try login user to the system', LoginOuputDto)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@ExtractUserFromRequest() user: UserJwtPayloadDto, @Res({ passthrough: true }) response: Response): Promise<LoginOuputDto> {
    // в экспрессе делали так, здесь же валидация происходит в гварде
    // const userId = await this.authService.validateUser(body);
    // const accessToken = await this.authService.login(userId);
    const { accessToken, refreshToken } = await this.commandBus.execute<LoginUserCommand, { accessToken: string; refreshToken: string }>(new LoginUserCommand(user));

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax', // or 'strict' based on your requirements
    });

    return { accessToken };
  }

  @SwaggerGet('Get information about current user', MeViewDto, SwaggerAuthStatus.WithAuth)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<MeViewDto> {
    const currentUser = await this.usersQueryRepository.findMeByIdOrNotFound(user.userId);

    return currentUser;
  }

  @SwaggerPostWith429('Register new user')
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: RegistrationInputDto): Promise<void> {
    return await this.commandBus.execute<RegisterUserCommand, void>(new RegisterUserCommand(body));
  }

  @SwaggerPostWith429('Confirm registration of new user')
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: RegistrationConfirmationInputDto): Promise<void> {
    return await this.commandBus.execute<RegisterConfirmCommand, void>(new RegisterConfirmCommand(body.code));
  }

  @SwaggerPostWith429('Resend confirmation email')
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: ResendConfirmationInputDto): Promise<void> {
    return await this.commandBus.execute<ResendEmailCommand, void>(new ResendEmailCommand(body.email));
  }

  @SwaggerPostWith429('Password recovery')
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveryInputDto): Promise<void> {
    return await this.commandBus.execute<PassRecoveryCommand, void>(new PassRecoveryCommand(body.email));
  }

  @SwaggerPostWith429('Set new password')
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordInputDto): Promise<void> {
    return await this.commandBus.execute<SetNewPassCommand, void>(new SetNewPassCommand(body.code, body.newPassword));
  }
}
