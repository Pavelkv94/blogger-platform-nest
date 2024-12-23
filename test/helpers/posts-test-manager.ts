import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { delay } from './delay';
import { CreatePostForBlogDto } from 'src/features/bloggers-platform/posts/dto/post-create.dto';
import { LikeStatus } from 'src/features/bloggers-platform/likes/dto/like-status.dto';
import { PostViewDto } from 'src/features/bloggers-platform/posts/dto/post-view.dto';

export class PostsTestManager {
  constructor(private app: INestApplication) {}

  async getPosts(blog_id: string): Promise<PaginatedViewDto<PostViewDto[]>> {
    const response = await request(this.app.getHttpServer()).get(`/blogs/${blog_id}/posts`).auth('admin', 'qwerty').expect(200);

    return response.body;
  }

  async getPostsWithAuth(blog_id: string, token: string): Promise<PaginatedViewDto<PostViewDto[]>> {
    const response = await request(this.app.getHttpServer()).get(`/posts`).set({ Authorization: "Bearer " + token }).expect(200);

    return response.body;
  }

  async createPost(createModel: CreatePostForBlogDto, blog_id: string, statusCode: number = HttpStatus.CREATED): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer()).post(`/blogs/${blog_id}/posts`).send(createModel).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }

  // async createPostWithInvalidAuth(createModel: BlogCreateDto, statusCode: number = HttpStatus.UNAUTHORIZED): Promise<StandardErrorResponse> {
  //   const response = await request(this.app.getHttpServer()).post(`/blogs`).send(createModel).auth('admin', 'invalid').expect(statusCode);

  //   return response.body;
  // }

  // async deletePost(blogId: string, statusCode: number = HttpStatus.NO_CONTENT): Promise<BlogViewDto> {
  //   const response = await request(this.app.getHttpServer()).delete(`/blogs/${blogId}`).auth('admin', 'qwerty').expect(statusCode);

  //   return response.body;
  // }

  // async deletePostWithInvalidAuth(blogId: string, statusCode: number = HttpStatus.UNAUTHORIZED): Promise<StandardErrorResponse> {
  //   const response = await request(this.app.getHttpServer()).delete(`/blogs/${blogId}`).auth('admin', 'invalid').expect(statusCode);

  //   return response.body;
  // }

  async createSeveralPosts(count: number, blogId: string): Promise<PostViewDto[]> {
    const blogsPromises = [] as Promise<PostViewDto>[];

    for (let i = 0; i < count; ++i) {
      await delay(100);
      const response = this.createPost({ title: `post${i}`, shortDescription: `shortDescription${i}`, content: `content${i}` }, blogId);

      blogsPromises.push(response);
    }

    return Promise.all(blogsPromises);
  }

  async likePost(likeDto: {likeStatus: LikeStatus}, postId: string, token: string, statusCode: number = HttpStatus.NO_CONTENT): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer()).put(`/posts/${postId}/like-status`).set({ Authorization: "Bearer " + token }).send(likeDto).expect(statusCode);

    return response.body;
  }
}
