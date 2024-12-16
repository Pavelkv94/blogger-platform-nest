import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { LikesInfo } from './likes-info.schema';
import { CommentatorInfo } from './commentator-info.schema';
import { CommentatorInfoSchema } from './commentator-info.schema';
import { LikesInfoSchema } from './likes-info.schema';


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

  @Prop({ type: LikesInfoSchema, required: true, default: { likesCount: 0, dislikesCount: 0 } })
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
