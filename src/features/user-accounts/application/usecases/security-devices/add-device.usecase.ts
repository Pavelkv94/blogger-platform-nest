import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDeviceEntity, SecurityDeviceModelType } from 'src/features/user-accounts/domain/security-device/security-devices.schema';
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
  constructor(
    @InjectModel(SecurityDeviceEntity.name) private SecurityDeviceModel: SecurityDeviceModelType,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute(command: AddSecurityDeviceCommand): Promise<string> {
    const newDeviceId = await this.securityDevicesRepository.addDevice(command.refreshToken, command.ip, command.userAgent);

    return newDeviceId;
  }
}
