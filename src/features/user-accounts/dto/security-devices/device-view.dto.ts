import { SecurityDeviceDocument } from '../../domain/security-device/security-devices.schema';

export class DeviceViewDto {
  title: string;
  ip: string;
  deviceId: string;
  lastActiveDate: Date;

  constructor(model: any) {
    this.title = model.title;
    this.ip = model.ip;
    this.deviceId = model.device_id;
    this.lastActiveDate = model.last_active_date;
  }

  static mapToView(post: SecurityDeviceDocument): DeviceViewDto {
    return new DeviceViewDto(post);
  }
}
