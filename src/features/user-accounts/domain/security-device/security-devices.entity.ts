import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Column } from 'typeorm';
import { User } from '../user/user.entity';
import { UserJwtPayloadDto } from '../../dto/users/user-jwt-payload.dto';

@Entity()
export class SecurityDevice {
  @PrimaryColumn()
  deviceId: string;

  @Column()
  title: string;

  @Column()
  ip: string;

  @Column({ type: 'timestamptz' })
  lastActiveDate: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @Column({ type: 'timestamptz' })
  expirationDate: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.securityDevices)
  @JoinColumn({ name: 'userId' })
  user: User;

  static buildInstance(refreshToken: UserJwtPayloadDto, ip: string, userAgent: string): SecurityDevice {
    const device = new this();
    device.deviceId = refreshToken.deviceId;
    device.userId = +refreshToken.userId;
    device.lastActiveDate = new Date(refreshToken.iat * 1000);
    device.expirationDate = new Date(refreshToken.exp * 1000);
    device.title = userAgent;
    device.ip = ip;

    return device;
  }

  update(refreshToken: UserJwtPayloadDto, ip: string, userAgent: string) {
    this.ip = ip;
    this.title = userAgent;
    this.lastActiveDate = new Date(refreshToken.iat * 1000);
    this.expirationDate = new Date(refreshToken.exp * 1000);
    this.deviceId = refreshToken.deviceId;
    this.userId = +refreshToken.userId;
  }

  markDeleted() {
    if (this.deletedAt) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}
