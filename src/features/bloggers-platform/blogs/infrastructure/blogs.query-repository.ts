import { Injectable } from '@nestjs/common';
import { BlogViewDto } from '../dto/blog-view.dto';
import { GetBlogsQueryParams } from '../dto/get-blogs-query-params.input-dto';
import { PaginatedBlogViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundDomainException } from '../../../../core/exeptions/domain-exceptions';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectRepository(Blog) private blogRepositoryTypeOrm: Repository<Blog>) {}

  async findBlogs(queryData: GetBlogsQueryParams): Promise<PaginatedBlogViewDto> {
    const { pageSize, pageNumber, searchNameTerm, sortBy, sortDirection } = queryData;

    const queryBuilder = this.blogRepositoryTypeOrm.createQueryBuilder('blog').where('blog.deletedAt IS NULL');

    if (searchNameTerm) {
      queryBuilder.andWhere('blog.name ILIKE :searchNameTerm', { searchNameTerm: `%${searchNameTerm}%` });
    }

    const blogs = await queryBuilder
      .orderBy(`blog.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(queryData.calculateSkip())
      .take(pageSize)
      .getMany();

    const blogsCount = await queryBuilder.getCount();

    const blogsView = blogs.map((blog) => BlogViewDto.mapToView(blog));

    return PaginatedBlogViewDto.mapToView({
      items: blogsView,
      page: pageNumber,
      size: pageSize,
      totalCount: blogsCount,
    });
  }

  async findBlogByIdOrNotFoundFail(blogId: string): Promise<BlogViewDto> {
    const blog = await this.blogRepositoryTypeOrm
      .createQueryBuilder('blog')
      .where('blog.id = :id', { id: Number(blogId) })
      .andWhere('blog.deletedAt IS NULL')
      .getOne();

    if (!blog) {
      throw NotFoundDomainException.create('Blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }
}
