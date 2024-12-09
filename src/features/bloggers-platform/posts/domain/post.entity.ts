import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { CreatePostDto } from '../dto/post-create.dto';
import { UpdatePostDto } from '../dto/post-update.dto';

//! Ask about intefaces
export interface NewestLike {
  addedAt: string;
  userId: string;
  login: string;
}

//! Ask about intefaces
interface ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  newestLikes: NewestLike[];
}

const NewestLikeSchema = {
  addedAt: { type: String, required: true },
  userId: { type: String, required: true },
  login: { type: String, required: true },
};

const ExtendedLikesInfoSchema = {
  likesCount: { type: Number, required: true, default: 0 },
  dislikesCount: { type: Number, required: true, default: 0 },
  newestLikes: [NewestLikeSchema],
};

@Schema({ timestamps: true })
export class PostEntity {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: String, required: true, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  @Prop({
    type: ExtendedLikesInfoSchema,
    required: true,
    default: {
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    },
  })
  extendedLikesInfo: ExtendedLikesInfo;

  static buildInstance(dto: CreatePostDto, blogName: string): PostDocument {
    const post = new this(); //PostModel!

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = blogName;

    return post as PostDocument;
  }

  update(dto: UpdatePostDto): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }

  makeDeleted(): void {
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}

export const PostSchema = SchemaFactory.createForClass(PostEntity);

PostSchema.loadClass(PostEntity);

export type PostDocument = HydratedDocument<PostEntity>;

export type PostModelType = Model<PostDocument> & typeof PostEntity;
