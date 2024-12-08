import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDocument, BlogEntity, BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(BlogEntity.name) private BlogModel: BlogModelType) {}

  async findBlogById(id: string): Promise<BlogDocument | null> {
    const blogDocument = await this.BlogModel.findOne({ _id: id });
    if (!blogDocument) {
      return null;
    }
    return blogDocument;
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.findBlogById(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }
}
