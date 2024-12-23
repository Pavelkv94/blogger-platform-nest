import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDeviceEntity, SecurityDeviceModelType } from 'src/features/user-accounts/domain/security-device/security-devices.schema';
import { SecurityDevicesRepository } from 'src/features/user-accounts/infrastructure/security-devices/security-devices.repository';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/user-jwt-payload.dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

export class UpdateSecurityDeviceCommand {
  constructor(
    public readonly refreshToken: UserJwtPayloadDto,
    public readonly ip: string,
    public readonly userAgent: string,
  ) {}
}

@CommandHandler(UpdateSecurityDeviceCommand)
export class UpdateSecurityDeviceUseCase implements ICommandHandler<UpdateSecurityDeviceCommand> {
  constructor(
    @InjectModel(SecurityDeviceEntity.name) private SecurityDeviceModel: SecurityDeviceModelType,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute(command: UpdateSecurityDeviceCommand): Promise<void> {
    const device = await this.securityDevicesRepository.findDevice(command.refreshToken.deviceId);

    if (!device) {
      throw NotFoundDomainException.create('Security Device not found');
    }
    device.update(command.refreshToken, command.ip, command.userAgent);

    await this.securityDevicesRepository.save(device);
  }
}
