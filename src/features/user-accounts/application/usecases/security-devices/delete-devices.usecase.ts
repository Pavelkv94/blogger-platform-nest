import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserJwtPayloadDto } from '../../../dto/users/user-jwt-payload.dto';
import { SecurityDevicesRepository } from '../../../infrastructure/security-devices/security-devices.repository';

export class DeleteOtherSecurityDevicesCommand {
  constructor(public readonly user: UserJwtPayloadDto) {}
}

@CommandHandler(DeleteOtherSecurityDevicesCommand)
export class DeleteOtherSecurityDevicesUseCase implements ICommandHandler<DeleteOtherSecurityDevicesCommand> {
  constructor(private readonly securityDevicesRepository: SecurityDevicesRepository) {}

  async execute(command: DeleteOtherSecurityDevicesCommand): Promise<void> {
    await this.securityDevicesRepository.deleteOtherSecurityDevices(command.user.userId, command.user.deviceId);
  }
}
