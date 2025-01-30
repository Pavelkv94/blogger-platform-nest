import { Injectable } from '@nestjs/common';
import { ResultObject, ResultStatus } from 'src/core/dto/result-object.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateCommentInputDto } from '../dto/create-comment.dto';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/users/user-jwt-payload.dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findCommentById(commentId: string, userId?: string): Promise<ResultObject<any | null>> {
    const query = `
    SELECT * FROM comments WHERE id = $1 AND deleted_at IS NULL
    `;
    const comments = await this.dataSource.query(query, [commentId]);

    if (!comments[0]) {
      return {
        status: ResultStatus.NOT_FOUND,
        errorMessage: 'Comment Not Found',
        data: null,
      };
    }

    if (userId && comments[0].commentator_id !== userId) {
      return {
        status: ResultStatus.FORBIDDEN,
        errorMessage: 'Access forbidden',
        data: null,
      };
    }
    return {
      status: ResultStatus.SUCCESS,
      data: comments[0],
    };
  }

  async createComment(payload: CreateCommentInputDto, postId: string, user: UserJwtPayloadDto): Promise<string> {
    const query = `
    INSERT INTO comments (content, post_id, commentator_id) VALUES ($1, $2, $3) RETURNING id`;
    const newComment = await this.dataSource.query(query, [payload.content, postId, user.userId]);
    return newComment[0].id;
  }

  async updateComment(commentId: string, content: string): Promise<void> {
    const query = `
    UPDATE comments SET content = $1 WHERE id = $2`;
    await this.dataSource.query(query, [content, commentId]);
  }

  async deleteComment(commentId: string): Promise<void> {
    const query = `
    UPDATE comments SET deleted_at = NOW() WHERE id = $1`;
    await this.dataSource.query(query, [commentId]);
  }
}
