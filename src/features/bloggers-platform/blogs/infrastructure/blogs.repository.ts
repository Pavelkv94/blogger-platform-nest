import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDocument, BlogEntity, BlogModelType } from '../domain/blog.entity';
import { DeletionStatus } from 'src/core/dto/deletion-status';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(BlogEntity.name) private BlogModel: BlogModelType) {}

  async findBlogById(id: string): Promise<BlogDocument | null> {
    const blogDocument = await this.BlogModel.findOne({ _id: id, deletionStatus: DeletionStatus.NotDeleted });
    if (!blogDocument) {
      return null;
    }
    return blogDocument;
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }
}
