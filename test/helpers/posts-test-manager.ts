import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { delay } from './delay';
import { CreatePostForBlogDto } from '../../src/features/bloggers-platform/posts/dto/post-create.dto';
import { LikeStatus } from '../../src/features/bloggers-platform/likes/dto/like-status.dto';
import { PostViewDto } from '../../src/features/bloggers-platform/posts/dto/post-view.dto';
import { UpdatePostDto } from '../../src/features/bloggers-platform/posts/dto/post-update.dto';

export class PostsTestManager {
  constructor(private app: INestApplication) {}

  async getPosts(blog_id: string, query: string): Promise<PaginatedViewDto<PostViewDto[]>> {
    const response = await request(this.app.getHttpServer()).get(`/sa/blogs/${blog_id}/posts${query}`).auth('admin', 'qwerty').expect(200);

    return response.body;
  }

  async getPostsWithAuth(blog_id: string, token: string): Promise<PaginatedViewDto<PostViewDto[]>> {
    const response = await request(this.app.getHttpServer())
      .get(`/sa/posts`)
      .set({ Authorization: 'Bearer ' + token })
      .expect(200);

    return response.body;
  }

  async getPost(postId: string): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer()).get(`/posts/${postId}`).expect(200);

    return response.body;
  }

  async getPostWithAuth(postId: string, token: string): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer()).get(`/posts/${postId}`).set({ Authorization: 'Bearer ' + token }).expect(200);

    return response.body;
  }

  async createPost(createModel: CreatePostForBlogDto, blog_id: string, statusCode: number = HttpStatus.CREATED): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer()).post(`/sa/blogs/${blog_id}/posts`).send(createModel).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }

  async deletePost(postId: string, blogId: string, statusCode: number = HttpStatus.NO_CONTENT): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer()).delete(`/sa/blogs/${blogId}/posts/${postId}`).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }

  async createSeveralPosts(count: number, blogId: string): Promise<PostViewDto[]> {
    const blogsPromises = [] as Promise<PostViewDto>[];

    for (let i = 0; i < count; ++i) {
      await delay(100);
      const response = this.createPost({ title: `post${i}`, shortDescription: `shortDescription${i}`, content: `content${i}` }, blogId);

      blogsPromises.push(response);
    }

    return Promise.all(blogsPromises);
  }

  async updatePost(postId: string, updateModel: UpdatePostDto, blogId: string, statusCode: number = HttpStatus.NO_CONTENT): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer()).put(`/sa/blogs/${blogId}/posts/${postId}`).send(updateModel).auth('admin', 'qwerty').expect(statusCode);

    return response.body;
  }

  async likePost(likeDto: { likeStatus: LikeStatus }, postId: string, token: string, statusCode: number = HttpStatus.NO_CONTENT): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer())
      .put(`/posts/${postId}/like-status`)
      .set({ Authorization: 'Bearer ' + token })
      .send(likeDto)
      .expect(statusCode);

    return response.body;
  }
}
