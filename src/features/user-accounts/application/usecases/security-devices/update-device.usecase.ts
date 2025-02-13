import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../../infrastructure/security-devices/security-devices.repository';
import { UserJwtPayloadDto } from '../../../dto/users/user-jwt-payload.dto';

export class UpdateSecurityDeviceCommand {
  constructor(
    public readonly refreshToken: UserJwtPayloadDto,
    public readonly ip: string,
    public readonly userAgent: string,
  ) {}
}

@CommandHandler(UpdateSecurityDeviceCommand)
export class UpdateSecurityDeviceUseCase implements ICommandHandler<UpdateSecurityDeviceCommand> {
  constructor(private readonly securityDevicesRepository: SecurityDevicesRepository) {}

  async execute(command: UpdateSecurityDeviceCommand): Promise<void> {
    await this.securityDevicesRepository.updateDevice(command.refreshToken, command.ip, command.userAgent);
  }
}
