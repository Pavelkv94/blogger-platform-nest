import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceViewDto } from '../../dto/security-devices/device-view.dto';
import { SecurityDeviceEntity, SecurityDeviceModelType } from '../../domain/security-device/security-devices.schema';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { DeletionStatus } from 'src/core/dto/deletion-status';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(@InjectModel(SecurityDeviceEntity.name) private SecurityDeviceModel: SecurityDeviceModelType) {}

  async findSecurityDevices(userId: string): Promise<DeviceViewDto[]> {
    const devices = await this.SecurityDeviceModel.find({ user_id: userId, deletionStatus: DeletionStatus.NotDeleted });

    return devices.map((device) => DeviceViewDto.mapToView(device));
  }

  async findDevice(device_id: string): Promise<DeviceViewDto> {
    const device = await this.SecurityDeviceModel.findOne({ deviceId: device_id, deletionStatus: DeletionStatus.NotDeleted });
    if (!device) {
      throw NotFoundDomainException.create('Device not found');
    }
    return DeviceViewDto.mapToView(device);
  }
}
