import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlogCreateDto } from '../dto/blog-create.dto';
import { BlogUpdateDto } from '../dto/blog-update.dto';
import { DeletionStatus } from 'src/core/dto/deletion-status';

@Schema({ timestamps: true })
export class BlogEntity {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  websiteUrl: string;

  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: String, required: true, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  static buildInstance(dto: BlogCreateDto): BlogDocument {
    const blog = new this(); //UserModel!

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    return blog as BlogDocument;
  }

  makeDeleted() {
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }

  update(dto: BlogUpdateDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(BlogEntity);

BlogSchema.loadClass(BlogEntity);

export type BlogDocument = HydratedDocument<BlogEntity>;

export type BlogModelType = Model<BlogDocument> & typeof BlogEntity;
