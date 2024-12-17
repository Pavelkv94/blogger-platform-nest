import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { UserJwtPayloadDto } from '../../dto/user-jwt-payload.dto';

export class LoginUserCommand {
  constructor(public readonly payload: UserJwtPayloadDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(@Inject() private readonly jwtService: JwtService) {}

  async execute(command: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign(command.payload);
    const refreshToken = this.jwtService.sign(command.payload, { expiresIn: '10d' });

    return { accessToken, refreshToken };
  }
}
