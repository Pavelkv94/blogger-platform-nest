import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogEntity, BlogModelType } from '../domain/blog.entity';
import { BlogViewDto } from '../dto/blog-view.dto';
import { GetBlogsQueryParams } from '../dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DeletionStatus } from 'src/core/dto/deletion-status';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(BlogEntity.name) private BlogModel: BlogModelType) {}

  async findBlogs(queryData: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const { pageSize, pageNumber, searchNameTerm, sortBy, sortDirection } = queryData;

    const filter: any = {};

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    const blogsFromDb = await this.BlogModel.find({ ...filter, deletionStatus: DeletionStatus.NotDeleted })
      .skip(queryData.calculateSkip())
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const blogsView = blogsFromDb.map((blog) => BlogViewDto.mapToView(blog));

    const blogsCount = await this.getBlogsCount(searchNameTerm || null);

    return PaginatedViewDto.mapToView({
      items: blogsView,
      page: pageNumber,
      size: pageSize,
      totalCount: blogsCount,
    });
  }

  async findBlogById(blogId: string): Promise<BlogViewDto | null> {
    const blog = await this.BlogModel.findOne({ _id: blogId, deletionStatus: DeletionStatus.NotDeleted });
    return blog ? BlogViewDto.mapToView(blog) : null;
  }
  private async getBlogsCount(searchNameTerm: string | null): Promise<number> {
    const filter: any = { deletionStatus: DeletionStatus.NotDeleted };

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    return await this.BlogModel.countDocuments(filter);
  }
}
