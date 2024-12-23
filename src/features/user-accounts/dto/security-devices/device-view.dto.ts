import { SecurityDeviceDocument } from '../../domain/security-device/security-devices.schema';

export class DeviceViewDto {
  title: string;
  ip: string;
  deviceId: string;
  lastActiveDate: Date;

  constructor(model: SecurityDeviceDocument) {
    this.title = model.title;
    this.ip = model.ip;
    this.deviceId = model.deviceId;
    this.lastActiveDate = model.lastActiveDate;
  }

  static mapToView(post: SecurityDeviceDocument): DeviceViewDto {
    return new DeviceViewDto(post);
  }
}
