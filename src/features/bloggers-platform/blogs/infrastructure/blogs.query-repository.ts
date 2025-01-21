import { Injectable } from '@nestjs/common';
import { BlogViewDto } from '../dto/blog-view.dto';
import { GetBlogsQueryParams } from '../dto/get-blogs-query-params.input-dto';
import { PaginatedBlogViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private datasourse: DataSource) {}

  async findBlogs(queryData: GetBlogsQueryParams): Promise<PaginatedBlogViewDto> {
    const { pageSize, pageNumber, searchNameTerm, sortBy, sortDirection } = queryData;

    const values: string[] = [];

    if (searchNameTerm) {
      values.push(`%${searchNameTerm}%`);
    }

    const query = `
    SELECT * FROM blogs 
    WHERE deleted_at IS NULL ${searchNameTerm ? `AND name ILIKE $${values.length}` : ''}
    ORDER BY ${sortBy} ${sortDirection} 
    LIMIT ${pageSize} OFFSET ${queryData.calculateSkip()}
    `;

    const blogs = await this.datasourse.query(query, values);

    const blogsCount = await this.datasourse.query(
      `
      SELECT COUNT(*) FROM blogs 
      WHERE deleted_at IS NULL ${searchNameTerm ? `AND name ILIKE $${values.length}` : ''}
    `,
      values,
    );

    const blogsView = blogs.map((blog) => BlogViewDto.mapToView(blog));

    return PaginatedBlogViewDto.mapToView({
      items: blogsView,
      page: pageNumber,
      size: pageSize,
      totalCount: +blogsCount[0].count,
    });
  }

  async findBlogByIdOrNotFoundFail(blogId: string): Promise<BlogViewDto> {
    const blogs = await this.datasourse.query(
      `
      SELECT * FROM blogs 
      WHERE id = $1 AND deleted_at IS NULL
    `,
      [blogId],
    );

    if (!blogs[0]) {
      throw NotFoundDomainException.create('Blog not found');
    }

    return BlogViewDto.mapToView(blogs[0]);
  }
}
