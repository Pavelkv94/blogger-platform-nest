import { Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { LoginTransferDto } from 'src/features/user-accounts/dto/login-user.dto';
import { AddSecurityDeviceCommand } from '../security-devices/add-device.usecase';
import { CoreConfig } from 'src/core/core.config';

export class LoginUserCommand {
  constructor(public readonly loginTransferDto: LoginTransferDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject() private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
    private readonly coreConfig: CoreConfig,
  ) {}

  async execute(command: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const payloadForJwt = {
      userId: command.loginTransferDto.userId,
      deviceId: command.loginTransferDto.device_id,
    };

    const accessToken = this.jwtService.sign(payloadForJwt, { expiresIn: this.coreConfig.accessTokenExpirationTime, secret: this.coreConfig.accessTokenSecret });
    const refreshToken = this.jwtService.sign(payloadForJwt, { expiresIn: this.coreConfig.refreshTokenExpirationTime, secret: this.coreConfig.refreshTokenSecret });

    const payloadFromJwt = this.jwtService.decode(refreshToken);

    //add security device
    await this.commandBus.execute(new AddSecurityDeviceCommand(payloadFromJwt, command.loginTransferDto.ip, command.loginTransferDto.userAgent));

    return { accessToken, refreshToken };
  }
}
