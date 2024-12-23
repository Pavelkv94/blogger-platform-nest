import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SecurityDeviceDocument, SecurityDeviceEntity, SecurityDeviceModelType } from '../../domain/security-device/security-devices.schema';
import { DeletionStatus } from 'src/core/dto/deletion-status';

@Injectable()
export class SecurityDevicesRepository {
  constructor(@InjectModel(SecurityDeviceEntity.name) private SecurityDeviceModel: SecurityDeviceModelType) {}

  async findSecurityDevices(userId: string): Promise<SecurityDeviceDocument[]> {
    const devices = await this.SecurityDeviceModel.find({ user_id: userId, deletionStatus: DeletionStatus.NotDeleted });

    return devices;
  }

  async findDevice(device_id: string): Promise<SecurityDeviceDocument | null> {
    const device = await this.SecurityDeviceModel.findOne({ deviceId: device_id, deletionStatus: DeletionStatus.NotDeleted });
    if (!device) {
      return null;
    }
    return device;
  }

  async findDeviceByToken(device_id: string, lastActiveDate: Date): Promise<SecurityDeviceDocument | null> {
    const device = await this.SecurityDeviceModel.findOne({ deviceId: device_id, lastActiveDate: lastActiveDate, deletionStatus: DeletionStatus.NotDeleted });
    if (!device) {
      return null;
    }
    return device;
  }

  async save(securityDevice: SecurityDeviceDocument): Promise<void> {
    await securityDevice.save();
  }
}
