import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeletionStatus } from 'src/core/dto/deletion-status';

export interface CommentatorInfo {
  userId: string;
  userLogin: string;
}

export interface LikesInfo {
  likesCount: number;
  dislikesCount: number;
}

const CommentatorInfoSchema = {
  userId: { type: String, required: true },
  userLogin: { type: String, required: true },
};

const LikesInfoSchema = {
  likesCount: { type: Number, required: true, default: 0 },
  dislikesCount: { type: Number, required: true, default: 0 },
};

@Schema({ timestamps: true })
export class CommentEntity {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: String, required: true, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: LikesInfoSchema, required: true })
  likesInfo: LikesInfo;

  // static buildInstance(dto: BlogCreateDto): BlogDocument {
  //   const blog = new this(); //UserModel!

  //   blog.name = dto.name;
  //   blog.description = dto.description;
  //   blog.websiteUrl = dto.websiteUrl;

  //   return blog as BlogDocument;
  // }

  makeDeleted() {
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }

  // update(dto: BlogUpdateDto) {
  //   this.name = dto.name;
  //   this.description = dto.description;
  //   this.websiteUrl = dto.websiteUrl;
  // }
}

export const CommentSchema = SchemaFactory.createForClass(CommentEntity);

CommentSchema.loadClass(CommentEntity);

export type CommentDocument = HydratedDocument<CommentEntity>;

export type CommentModelType = Model<CommentDocument> & typeof CommentEntity;
