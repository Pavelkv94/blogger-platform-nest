import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../dto/like-status.dto';
import { UserDocument } from 'src/features/user-accounts/domain/user/user.entity';

@Schema({ timestamps: true })
export class LikeEntity {
  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: String, required: true })
  user_login: string;

  @Prop({ type: String, required: true })
  parent_id: string;

  @Prop({ type: String, required: true, default: LikeStatus.None })
  status: LikeStatus;

  @Prop({ type: Date })
  updatedAt: Date;

  static buildInstance(user: UserDocument, parent_id: string, newStatus: LikeStatus) {
    const like = new this();

    like.user_id = user._id.toString();
    like.user_login = user.login;
    like.parent_id = parent_id;
    like.status = newStatus;
    like.updatedAt = new Date();

    return like as LikeDocument;
  }

  update(newStatus: LikeStatus) {
    this.status = newStatus;
    this.updatedAt = new Date();
  }
}

export const LikeSchema = SchemaFactory.createForClass(LikeEntity);

LikeSchema.loadClass(LikeEntity);

export type LikeDocument = HydratedDocument<LikeEntity>;

export type LikeModelType = Model<LikeDocument> & typeof LikeEntity;
