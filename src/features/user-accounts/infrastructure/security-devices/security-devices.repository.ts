import { Injectable } from '@nestjs/common';
import { UserJwtPayloadDto } from '../../dto/users/user-jwt-payload.dto';
import { IsNull, Not, Repository } from 'typeorm';
import { SecurityDevice } from '../../domain/security-device/security-devices.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundDomainException } from '../../../../core/exeptions/domain-exceptions';

@Injectable()
export class SecurityDevicesRepository {
  constructor(@InjectRepository(SecurityDevice) private securityDeviceRepositoryTypeOrm: Repository<SecurityDevice>) {}

  async findSecurityDevices(userId: string): Promise<SecurityDevice[]> {
    const devices = await this.securityDeviceRepositoryTypeOrm.find({ where: { userId: +userId, deletedAt: IsNull() } });

    return devices;
  }

  async findDevice(device_id: string): Promise<SecurityDevice | null> {
    const device = await this.securityDeviceRepositoryTypeOrm.findOne({ where: { deviceId: device_id, deletedAt: IsNull() } });

    if (!device) {
      return null;
    }
    return device;
  }

  async findDeviceByToken(payload: UserJwtPayloadDto): Promise<SecurityDevice | null> {
    const lastActiveDate = new Date(payload.iat * 1000);

    const device = await this.securityDeviceRepositoryTypeOrm.findOne({ where: { deviceId: payload.deviceId, lastActiveDate, deletedAt: IsNull() } });

    if (!device) {
      return null;
    }
    return device;
  }

  // async save(securityDevice: SecurityDevice): Promise<void> {
  //   await this.securityDeviceRepositoryTypeOrm.save(securityDevice);
  // }

  async addDevice(refreshToken: UserJwtPayloadDto, ip: string, userAgent: string): Promise<string> {
    const newDevice = SecurityDevice.buildInstance(refreshToken, ip, userAgent);

    await this.securityDeviceRepositoryTypeOrm.save(newDevice);

    //   const query = `
    //   INSERT INTO security_devices(
    // title, ip, last_active_date, user_id, expiration_date, device_id)
    // VALUES ($1, $2, $3, $4, $5, $6) RETURNING device_id;
    //   `;

    //   const device = await this.datasourse.query(query, [
    //     userAgent,
    //     ip,
    //     new Date(refreshToken.iat * 1000).toISOString(),
    //     refreshToken.userId,
    //     new Date(refreshToken.exp * 1000).toISOString(),
    //     refreshToken.deviceId,
    //   ]);

    return newDevice.deviceId;
  }

  async updateDevice(refreshDto: UserJwtPayloadDto, ip: string, userAgent: string): Promise<void> {
    const device = await this.findDevice(refreshDto.deviceId);

    if (!device) {
      throw NotFoundDomainException.create('Device not found');
    }

    device.update(refreshDto, ip, userAgent);

    await this.securityDeviceRepositoryTypeOrm.save(device);

    // await this.datasourse.query(`UPDATE security_devices SET ip = $1, title = $2, last_active_date = $3 WHERE device_id = $4`, [
    //   ip,
    //   userAgent,
    //   new Date(refreshDto.iat * 1000).toISOString(),
    //   refreshDto.deviceId,
    // ]);
  }

  async deleteDevice(deviceId: string): Promise<void> {
    const device = await this.findDevice(deviceId);

    if (!device) {
      throw NotFoundDomainException.create('Device not found');
    }

    device.markDeleted();

    await this.securityDeviceRepositoryTypeOrm.save(device);

    // await this.datasourse.query(`UPDATE security_devices SET deleted_at = NOW() WHERE device_id = $1`, [deviceId]);
  }

  async deleteOtherSecurityDevices(userId: string, deviceId: string): Promise<void> {
    const devices = await this.securityDeviceRepositoryTypeOrm.find({ where: { userId: +userId, deletedAt: IsNull(), deviceId: Not(deviceId) } });

    devices.forEach((device) => {
      device.markDeleted();
    });

    await this.securityDeviceRepositoryTypeOrm.save(devices);

    // await this.datasourse.query(`UPDATE security_devices SET deleted_at = NOW() WHERE user_id = $1 AND device_id != $2`, [userId, deviceId]);
  }
}
