import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDocument, BlogEntity, BlogModelType } from '../domain/blog.entity';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { DeletionStatus } from 'src/core/dto/deletion-status';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(BlogEntity.name) private BlogModel: BlogModelType) {}

  async findBlogByIdOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blogDocument = await this.BlogModel.findOne({ _id: id, deletionStatus: DeletionStatus.NotDeleted });
    if (!blogDocument) {
      throw NotFoundDomainException.create('Blog not found');
    }
    return blogDocument;
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }
}
