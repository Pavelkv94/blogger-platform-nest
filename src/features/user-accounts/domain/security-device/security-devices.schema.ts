import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { UserJwtPayloadDto } from '../../dto/user-jwt-payload.dto';

@Schema({ timestamps: true })
export class SecurityDeviceEntity {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Number, required: true })
  expirationDate: number;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: Date })
  lastActiveDate: Date;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  static buildInstance(refreshToken: UserJwtPayloadDto, ip: string, userAgent: string): SecurityDeviceDocument {
    const device = new this();

    device.deviceId = refreshToken.deviceId;
    device.user_id = refreshToken.userId;
    device.lastActiveDate = new Date(refreshToken.iat * 1000);
    device.expirationDate = refreshToken.exp;
    device.title = userAgent;
    device.ip = ip;

    return device as SecurityDeviceDocument;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Entity already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }

  update(refreshToken: UserJwtPayloadDto, ip: string, userAgent: string) {
    this.deviceId = refreshToken.deviceId;
    this.user_id = refreshToken.userId;
    this.lastActiveDate = new Date(refreshToken.iat * 1000);
    this.expirationDate = refreshToken.exp;
    this.title = userAgent;
    this.ip = ip;
  }
}

export const SecurityDeviceSchema = SchemaFactory.createForClass(SecurityDeviceEntity);

SecurityDeviceSchema.loadClass(SecurityDeviceEntity);

export type SecurityDeviceDocument = HydratedDocument<SecurityDeviceEntity>;

export type SecurityDeviceModelType = Model<SecurityDeviceDocument> & typeof SecurityDeviceEntity;
