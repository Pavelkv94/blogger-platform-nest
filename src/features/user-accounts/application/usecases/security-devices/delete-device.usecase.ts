import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from 'src/features/user-accounts/infrastructure/security-devices/security-devices.repository';
import { ForbiddenDomainException, NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

export class DeleteSecurityDeviceCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteSecurityDeviceCommand)
export class DeleteSecurityDeviceUseCase implements ICommandHandler<DeleteSecurityDeviceCommand> {
  constructor(private readonly securityDevicesRepository: SecurityDevicesRepository) {}

  async execute(command: DeleteSecurityDeviceCommand): Promise<void> {
    if (!command.deviceId) {
      throw NotFoundDomainException.create('Device not found');
    }
    const currentDevice = await this.securityDevicesRepository.findDevice(command.deviceId);

    if (!currentDevice) {
      throw NotFoundDomainException.create('Device not found');
    }

    const isOwner = currentDevice.user_id === command.userId;

    if (!isOwner) {
      throw ForbiddenDomainException.create('Access forbidden');
    }

    currentDevice.makeDeleted();

    await this.securityDevicesRepository.save(currentDevice);
  }
}
