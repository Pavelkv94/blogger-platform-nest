import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from 'src/features/user-accounts/infrastructure/security-devices/security-devices.repository';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/user-jwt-payload.dto';

export class AddSecurityDeviceCommand {
  constructor(
    public readonly refreshToken: UserJwtPayloadDto,
    public readonly ip: string,
    public readonly userAgent: string,
  ) {}
}

@CommandHandler(AddSecurityDeviceCommand)
export class AddSecurityDeviceUseCase implements ICommandHandler<AddSecurityDeviceCommand> {
  constructor(private readonly securityDevicesRepository: SecurityDevicesRepository) {}

  async execute(command: AddSecurityDeviceCommand): Promise<string> {
    const newDeviceId = await this.securityDevicesRepository.addDevice(command.refreshToken, command.ip, command.userAgent);

    return newDeviceId;
  }
}
