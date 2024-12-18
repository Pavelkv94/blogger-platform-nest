import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatuses } from '../dto/like-status.dto';

@Schema({ timestamps: true })
export class LikeEntity {
  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: String, required: true })
  user_login: string;

  @Prop({ type: String, required: true })
  parent_id: string;

  @Prop({ type: String, required: true, default: LikeStatuses.None })
  status: LikeStatuses;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(LikeEntity);

LikeSchema.loadClass(LikeEntity);

export type LikeDocument = HydratedDocument<LikeEntity>;

export type LikeModelType = Model<LikeDocument> & typeof LikeEntity;
