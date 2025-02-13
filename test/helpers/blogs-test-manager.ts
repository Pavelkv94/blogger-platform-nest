import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../src/features/bloggers-platform/blogs/dto/blog-view.dto';
import { BlogCreateDto } from '../../src/features/bloggers-platform/blogs/dto/blog-create.dto';
import { StandardErrorResponse } from '../../src/core/exeptions/filters/base-exception-filter';
import { delay } from './delay';
import { BlogUpdateDto } from '../../src/features/bloggers-platform/blogs/dto/blog-update.dto';

export class BlogsTestManager {
  constructor(private app: INestApplication) {}

  async getBlogs(query: string = ''): Promise<PaginatedViewDto<BlogViewDto>> {
    const response = await request(this.app.getHttpServer()).get(`/sa/blogs${query}`).auth('admin', 'qwerty').expect(200);

    return response.body;
  }

  async createBlog(createModel: BlogCreateDto, statusCode: number = HttpStatus.CREATED): Promise<BlogViewDto> {
    const response = await request(this.app.getHttpServer()).post(`/sa/blogs`).send(createModel).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }

  async createBlogWithInvalidAuth(createModel: BlogCreateDto, statusCode: number = HttpStatus.UNAUTHORIZED): Promise<StandardErrorResponse> {
    const response = await request(this.app.getHttpServer()).post(`/sa/blogs`).send(createModel).auth('admin', 'invalid').expect(statusCode);

    return response.body;
  }

  async updateBlog(blogId: string, updateModel: BlogUpdateDto, statusCode: number = HttpStatus.NO_CONTENT): Promise<BlogViewDto> {
    const response = await request(this.app.getHttpServer()).put(`/sa/blogs/${blogId}`).send(updateModel).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }
  
  async deleteBlog(blogId: string, statusCode: number = HttpStatus.NO_CONTENT): Promise<BlogViewDto> {
    const response = await request(this.app.getHttpServer()).delete(`/sa/blogs/${blogId}`).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }

  async deleteBlogWithInvalidAuth(blogId: string, statusCode: number = HttpStatus.UNAUTHORIZED): Promise<StandardErrorResponse> {
    const response = await request(this.app.getHttpServer()).delete(`/sa/blogs/${blogId}`).auth('admin', 'invalid').expect(statusCode);

    return response.body;
  }

  async createSeveralBlogs(count: number): Promise<BlogViewDto[]> {
    const blogsPromises = [] as Promise<BlogViewDto>[];

    for (let i = 0; i < count; ++i) {
      await delay(100);
      const response = this.createBlog({
        name: `name${i}`,
        description: `description${i}`,
        websiteUrl: `example${i}.com`,
      });

      blogsPromises.push(response);
    }

    return Promise.all(blogsPromises);
  }
}
