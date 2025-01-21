import { Inject, Injectable } from '@nestjs/common';
import { DeviceViewDto } from '../../dto/security-devices/device-view.dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(@Inject() private datasourse: DataSource) {}

  async findSecurityDevices(userId: string): Promise<DeviceViewDto[]> {
    const query = `
    SELECT * FROM security_devices WHERE user_id = $1 AND deleted_at IS NULL
    `;
    const devices = await this.datasourse.query(query, [userId]);

    return devices.map((device) => DeviceViewDto.mapToView(device));
  }

  async findDevice(device_id: string): Promise<DeviceViewDto> {
    const query = `
    SELECT * FROM security_devices WHERE device_id = $1 AND deleted_at IS NULL
    `;
    const devices = await this.datasourse.query(query, [device_id]);

    if (!devices) {
      throw NotFoundDomainException.create('Device not found');
    }
    return DeviceViewDto.mapToView(devices[0]);
  }
}
