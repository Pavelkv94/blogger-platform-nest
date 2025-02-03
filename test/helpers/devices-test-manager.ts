import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export class DevicesTestManager {
  constructor(private app: INestApplication) {}

  async getDevicesWithAuth(refreshToken: string, statusCode: number = HttpStatus.OK) {
    const response = await request(this.app.getHttpServer())
      .get('/security/devices')
      .set("Cookie", [`refreshToken=${refreshToken}`])
      .expect(statusCode);

    return response.body;
  }

  // async createBlog(createModel: BlogCreateDto, statusCode: number = HttpStatus.CREATED): Promise<BlogViewDto> {
  //   const response = await request(this.app.getHttpServer()).post(`/blogs`).send(createModel).auth('admin', 'qwerty').expect(statusCode);

  //   return response.body;
  // }

  // async createBlogWithInvalidAuth(createModel: BlogCreateDto, statusCode: number = HttpStatus.UNAUTHORIZED): Promise<StandardErrorResponse> {
  //   const response = await request(this.app.getHttpServer()).post(`/blogs`).send(createModel).auth('admin', 'invalid').expect(statusCode);

  //   return response.body;
  // }

  // async deleteBlog(blogId: string, statusCode: number = HttpStatus.NO_CONTENT): Promise<BlogViewDto> {
  //   const response = await request(this.app.getHttpServer()).delete(`/blogs/${blogId}`).auth('admin', 'qwerty').expect(statusCode);

  //   return response.body;
  // }

  // async deleteBlogWithInvalidAuth(blogId: string, statusCode: number = HttpStatus.UNAUTHORIZED): Promise<StandardErrorResponse> {
  //   const response = await request(this.app.getHttpServer()).delete(`/blogs/${blogId}`).auth('admin', 'invalid').expect(statusCode);

  //   return response.body;
  // }

  // async createSeveralBlogs(count: number): Promise<BlogViewDto[]> {
  //   const blogsPromises = [] as Promise<BlogViewDto>[];

  //   for (let i = 0; i < count; ++i) {
  //     await delay(100);
  //     const response = this.createBlog({
  //       name: `name${i}`,
  //       description: `description${i}`,
  //       websiteUrl: `example${i}.com`,
  //     });

  //     blogsPromises.push(response);
  //   }

  //   return Promise.all(blogsPromises);
  // }
}
