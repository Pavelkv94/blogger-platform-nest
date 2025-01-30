import { Inject, Injectable } from '@nestjs/common';
// import { SecurityDeviceDocument } from '../../domain/security-device/security-devices.schema';
import { UserJwtPayloadDto } from '../../dto/users/user-jwt-payload.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityDevicesRepository {
  constructor(@Inject() private datasourse: DataSource) {}

  async findSecurityDevices(userId: string): Promise<any[]> {
    const query = `
    SELECT * FROM security_devices WHERE user_id = $1 AND deleted_at IS NULL
    `;
    const devices = await this.datasourse.query(query, [userId]);

    return devices;
  }

  async findDevice(device_id: string): Promise<any | null> {
    const query = `
    SELECT * FROM security_devices WHERE device_id = $1 AND deleted_at IS NULL
    `;
    const devices = await this.datasourse.query(query, [device_id]);

    if (!devices) {
      return null;
    }
    return devices[0];
  }

  async findDeviceByToken(payload: UserJwtPayloadDto): Promise<any | null> {
    const lastActiveDate = new Date(payload.iat * 1000).toISOString();

    const query = `
    SELECT * FROM security_devices WHERE device_id = $1 AND last_active_date = $2 AND deleted_at IS NULL
    `;
    const devices = await this.datasourse.query(query, [payload.deviceId, lastActiveDate]);
    if (!devices) {
      return null;
    }
    return devices[0];
  }

  async save(securityDevice: any): Promise<void> {
    await securityDevice.save();
  }

  async addDevice(refreshToken: UserJwtPayloadDto, ip: string, userAgent: string): Promise<string> {
    const query = `
    INSERT INTO security_devices(
	title, ip, last_active_date, user_id, expiration_date, device_id)
	VALUES ($1, $2, $3, $4, $5, $6) RETURNING device_id;
    `;

    const device = await this.datasourse.query(query, [
      userAgent,
      ip,
      new Date(refreshToken.iat * 1000).toISOString(),
      refreshToken.userId,
      new Date(refreshToken.exp * 1000).toISOString(),
      refreshToken.deviceId,
    ]);

    return device[0].device_id;
  }

  async updateDevice(refreshDto: UserJwtPayloadDto, ip: string, userAgent: string): Promise<void> {
    await this.datasourse.query(`UPDATE security_devices SET ip = $1, title = $2, last_active_date = $3 WHERE device_id = $4`, [
      ip,
      userAgent,
      new Date(refreshDto.iat * 1000).toISOString(),
      refreshDto.deviceId,
    ]);
  }

  async deleteDevice(deviceId: string): Promise<void> {
    await this.datasourse.query(`UPDATE security_devices SET deleted_at = NOW() WHERE device_id = $1`, [deviceId]);
  }

  async deleteOtherSecurityDevices(userId: string, deviceId: string): Promise<void> {
    await this.datasourse.query(`UPDATE security_devices SET deleted_at = NOW() WHERE user_id = $1 AND device_id != $2`, [userId, deviceId]);
  }
}
