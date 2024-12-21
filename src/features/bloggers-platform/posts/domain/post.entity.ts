import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { CreatePostDto } from '../dto/post-create.dto';
import { UpdatePostDto } from '../dto/post-update.dto';
import { ExtendedLikes } from './extended-likes.schema';
import { ExtendedLikesSchema } from './extended-likes.schema';

export const titleConstraints = {
  minLength: 1,
  maxLength: 30,
};

export const shortDescriptionConstraints = {
  minLength: 1,
  maxLength: 100,
};

export const contentConstraints = {
  minLength: 1,
  maxLength: 1000,
};

@Schema({ timestamps: true })
export class PostEntity {
  @Prop({ type: String, required: true, ...titleConstraints })
  title: string;

  @Prop({ type: String, required: true, ...shortDescriptionConstraints })
  shortDescription: string;

  @Prop({ type: String, required: true, ...contentConstraints })
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
    type: ExtendedLikesSchema,
    required: true,
    default: {
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    },
  })
  extendedLikesInfo: ExtendedLikes;

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
