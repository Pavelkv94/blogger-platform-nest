import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
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

@ApiTags('Auth') //swagger
@Controller('auth')
export class AuthController {
  constructor(
    @Inject() private readonly authService: AuthService,
    @Inject() private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @SwaggerPostForLogin('Try login user to the system', LoginOuputDto)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<LoginOuputDto> {
    // в экспрессе делали так, здесь же валидация происходит в гварде
    // const userId = await this.authService.validateUser(body);
    // const accessToken = await this.authService.login(userId);
    const accessToken = await this.authService.login(user);

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
    return await this.authService.registerUser(body);
  }

  @SwaggerPostWith429('Confirm registration of new user')
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: RegistrationConfirmationInputDto): Promise<void> {
    return await this.authService.registrationConfirmation(body.code);
  }

  @SwaggerPostWith429('Resend confirmation email')
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: ResendConfirmationInputDto): Promise<void> {
    return await this.authService.registrationEmailResending(body.email);
  }

  @SwaggerPostWith429('Password recovery')
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveryInputDto): Promise<void> {
    return await this.authService.passwordRecovery(body.email);
  }

  @SwaggerPostWith429('Set new password')
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordInputDto): Promise<void> {
    return await this.authService.newPassword(body.code, body.newPassword);
  }
}
