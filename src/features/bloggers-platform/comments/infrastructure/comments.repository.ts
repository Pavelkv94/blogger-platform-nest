import { Injectable } from '@nestjs/common';
import { ResultObject, ResultStatus } from 'src/core/dto/result-object.dto';
import {  IsNull, Repository } from 'typeorm';
import {  InjectRepository } from '@nestjs/typeorm';
import { CreateCommentInputDto } from '../dto/create-comment.dto';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/users/user-jwt-payload.dto';
import { Comment } from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment) private commentRepositoryTypeOrm: Repository<Comment>
  ) {}

  async findCommentById(commentId: string, userId?: string): Promise<ResultObject<any | null>> {
    const comment = await this.commentRepositoryTypeOrm.findOne({ where: { id: Number(commentId), deletedAt: IsNull() } });
    
    // const query = `
    // SELECT * FROM comments WHERE id = $1 AND deleted_at IS NULL
    // `;
    // const comments = await this.dataSource.query(query, [commentId]);

    if (!comment) {
      return {
        status: ResultStatus.NOT_FOUND,
        errorMessage: 'Comment Not Found',
        data: null,
      };
    }

    if (userId && comment.commentatorId !== userId) {
      return {
        status: ResultStatus.FORBIDDEN,
        errorMessage: 'Access forbidden',
        data: null,
      };
    }
    return {
      status: ResultStatus.SUCCESS,
      data: comment,
    };
  }

  async createComment(payload: CreateCommentInputDto, postId: string, user: UserJwtPayloadDto): Promise<string> {
    const comment = Comment.buildInstance(payload, postId, user);
    const newComment = await this.commentRepositoryTypeOrm.save(comment);
    return newComment.id.toString();
    // const query = `
    // INSERT INTO comments (content, post_id, commentator_id) VALUES ($1, $2, $3) RETURNING id`;
    // const newComment = await this.dataSource.query(query, [payload.content, postId, user.userId]);
    // return newComment[0].id;
  }

  async updateComment(comment: Comment, content: string): Promise<void> {
    comment.update(content);
    await this.commentRepositoryTypeOrm.save(comment);
    // const query = `
    // UPDATE comments SET content = $1 WHERE id = $2`;
    // await this.dataSource.query(query, [content, commentId]);
  }

  async deleteComment(comment: Comment): Promise<void> {
    comment.makeDeleted();
    await this.commentRepositoryTypeOrm.save(comment);
    // const query = `
    // UPDATE comments SET deleted_at = NOW() WHERE id = $1`;
    // await this.dataSource.query(query, [commentId]);
  }
}
