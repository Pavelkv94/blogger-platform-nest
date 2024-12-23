import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/user-jwt-payload.dto';
import { SecurityDevicesRepository } from 'src/features/user-accounts/infrastructure/security-devices/security-devices.repository';

export class DeleteOtherSecurityDevicesCommand {
  constructor(public readonly user: UserJwtPayloadDto) {}
}

@CommandHandler(DeleteOtherSecurityDevicesCommand)
export class DeleteOtherSecurityDevicesUseCase implements ICommandHandler<DeleteOtherSecurityDevicesCommand> {
  constructor(private readonly securityDevicesRepository: SecurityDevicesRepository) {}

  async execute(command: DeleteOtherSecurityDevicesCommand): Promise<void> {
    const devices = await this.securityDevicesRepository.findSecurityDevices(command.user.userId);

    devices.forEach(async (device) => {
      if (device.deviceId !== command.user.deviceId) {
        device.makeDeleted();
      }

      await this.securityDevicesRepository.save(device);
    });
  }
}
