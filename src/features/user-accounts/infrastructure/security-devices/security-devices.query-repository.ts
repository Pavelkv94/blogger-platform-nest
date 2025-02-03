import { Injectable } from '@nestjs/common';
import { DeviceViewDto } from '../../dto/security-devices/device-view.dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { IsNull, Repository } from 'typeorm';
import { SecurityDevice } from '../../domain/security-device/security-devices.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(@InjectRepository(SecurityDevice) private securityDeviceRepositoryTypeOrm: Repository<SecurityDevice>) {}

  async findSecurityDevices(userId: string): Promise<DeviceViewDto[]> {
    const devices = await this.securityDeviceRepositoryTypeOrm.find({ where: { userId: +userId, deletedAt: IsNull() } });

    return devices.map((device) => DeviceViewDto.mapToView(device));
  }

  async findDevice(device_id: string): Promise<DeviceViewDto> {
    const device = await this.securityDeviceRepositoryTypeOrm.findOne({ where: { deviceId: device_id, deletedAt: IsNull() } });

    if (!device) {
      throw NotFoundDomainException.create('Device not found');
    }
    return DeviceViewDto.mapToView(device);
  }
}
