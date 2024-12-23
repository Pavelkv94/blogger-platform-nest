import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from 'src/features/user-accounts/infrastructure/security-devices/security-devices.repository';

export class DeleteSecurityDevicesCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(DeleteSecurityDevicesCommand)
export class DeleteSecurityDevicesUseCase implements ICommandHandler<DeleteSecurityDevicesCommand> {
  constructor(private readonly securityDevicesRepository: SecurityDevicesRepository) {}

  async execute(command: DeleteSecurityDevicesCommand): Promise<void> {
    const devices = await this.securityDevicesRepository.findSecurityDevices(command.userId);

    devices.forEach(async (device) => {
      device.makeDeleted();

      await this.securityDevicesRepository.save(device);
    });
  }
}
