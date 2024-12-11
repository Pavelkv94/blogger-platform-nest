import { Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginOuputDto } from '../dto/login-user.dto';
import { AuthService } from '../application/auth.service';
import { MeViewDto } from '../dto/user-view.dto';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { UserJwtPayloadDto } from '../dto/user-jwt-payload.dto';
import { ExtractUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';

@ApiTags('Auth') //swagger
@Controller('auth')
export class AuthController {
  constructor(
    @Inject() private readonly authService: AuthService,
    @Inject() private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @ApiOperation({ summary: 'Try login user to the system' }) //swagger
  @ApiOkResponse({ type: LoginOuputDto }) //swagger
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        loginOrEmail: { type: 'string', example: 'login123', description: 'Login or email of the user' },
        password: { type: 'string', example: 'superpassword', description: 'Password of the user' },
      },
    },
  })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<LoginOuputDto> {
    // в экспрессе делали так, здесь же валидация происходит в гварде
    // const userId = await this.authService.validateUser(body);
    // const accessToken = await this.authService.login(userId);
    const accessToken = await this.authService.login(user);

    return { accessToken };
  }

  @ApiOperation({ summary: 'Get information about current user' }) //swagger
  @ApiOkResponse({ type: MeViewDto }) //swagger
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@ExtractUserFromRequest() user: UserJwtPayloadDto): Promise<MeViewDto> {
    const currentUser = await this.usersQueryRepository.findMeByIdOrNotFound(user.userId);

    return currentUser;
  }
}
