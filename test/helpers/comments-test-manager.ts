import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { delay } from './delay';
import { LikeStatus } from 'src/features/bloggers-platform/likes/dto/like-status.dto';
import { CommentViewDto } from 'src/features/bloggers-platform/comments/dto/comment-view.dto';
import { CreateCommentInputDto } from 'src/features/bloggers-platform/comments/dto/create-comment.dto';
import { UpdateCommentInputDto } from 'src/features/bloggers-platform/comments/dto/update-comment.dto';

export class CommentsTestManager {
  constructor(private app: INestApplication) {}

  async getComments(query: string): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const response = await request(this.app.getHttpServer()).get(`/comments${query}`).expect(200);

    return response.body;
  }

  async getComment(commentId: string): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer()).get(`/comments/${commentId}`).expect(200);

    return response.body;
  }
  async getCommentWithAuth(commentId: string, token: string): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer()).get(`/comments/${commentId}`).set('Authorization', 'Bearer ' + token).expect(200);

    return response.body;
  }
  

  async getPostComments(query: string, postId: string): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const response = await request(this.app.getHttpServer()).get(`/posts/${postId}/comments${query}`).expect(200);

    return response.body;
  }

  async createComment(createModel: CreateCommentInputDto, postId: string, token: string, statusCode: number = HttpStatus.CREATED): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .send(createModel)
      .set('Authorization', 'Bearer ' + token)
      .expect(statusCode);

    return response.body;
  }

  async updateComment(commentId: string, updateModel: UpdateCommentInputDto, token: string, statusCode: number = HttpStatus.NO_CONTENT): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer())
      .put(`/comments/${commentId}`)
      .send(updateModel)
      .set('Authorization', 'Bearer ' + token)
      .expect(statusCode);

    return response.body;
  }

  async deleteComment(commentId: string, token: string, statusCode: number = HttpStatus.NO_CONTENT): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer())
      .delete(`/comments/${commentId}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(statusCode);

    return response.body;
  }

  async createSeveralComments(count: number, postId: string, token: string): Promise<CommentViewDto[]> {
    const commentsPromises = [] as Promise<CommentViewDto>[];

    for (let i = 0; i < count; ++i) {
      await delay(100);
      const response = this.createComment({ content: `content with long length ${i}` }, postId, token);

      commentsPromises.push(response);
    }

    return Promise.all(commentsPromises);
  }

  async likeComment(likeDto: { likeStatus: LikeStatus }, commentId: string, token: string, statusCode: number = HttpStatus.NO_CONTENT): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer())
      .put(`/comments/${commentId}/like-status`)
      .set({ Authorization: 'Bearer ' + token })
      .send(likeDto)
      .expect(statusCode);

    return response.body;
  }
}
