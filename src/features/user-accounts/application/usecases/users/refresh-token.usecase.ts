import { Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { LoginTransferDto } from '../../../dto/users/login-user.dto';
import { CoreConfig } from '../../../../../core/core.config';
import { UpdateSecurityDeviceCommand } from '../security-devices/update-device.usecase';

export class RefreshTokenCommand {
  constructor(public readonly refreshDto: LoginTransferDto) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUserUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    @Inject() private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
    private readonly coreConfig: CoreConfig,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const payloadForJwt = {
      userId: command.refreshDto.userId,
      deviceId: command.refreshDto.device_id,
    };

    const accessToken = this.jwtService.sign(payloadForJwt, { expiresIn: this.coreConfig.accessTokenExpirationTime, secret: this.coreConfig.accessTokenSecret });
    const refreshToken = this.jwtService.sign(payloadForJwt, { expiresIn: this.coreConfig.refreshTokenExpirationTime, secret: this.coreConfig.refreshTokenSecret });

    const payloadFromJwt = this.jwtService.decode(refreshToken);

    //update security device
    await this.commandBus.execute(new UpdateSecurityDeviceCommand(payloadFromJwt, command.refreshDto.ip, command.refreshDto.userAgent));

    return { accessToken, refreshToken };
  }
}
