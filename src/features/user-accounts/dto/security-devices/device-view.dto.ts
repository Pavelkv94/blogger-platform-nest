export class DeviceViewDto {
  title: string;
  ip: string;
  deviceId: string;
  lastActiveDate: Date;

  constructor(model: any) {
    this.title = model.title;
    this.ip = model.ip;
    this.deviceId = model.deviceId;
    this.lastActiveDate = model.lastActiveDate;
  }

  static mapToView(post: any): DeviceViewDto {
    return new DeviceViewDto(post);
  }
}
