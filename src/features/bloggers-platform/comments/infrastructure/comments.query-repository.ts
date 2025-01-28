import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../dto/comment-view.dto';
import { GetPostsQueryParams } from '../../posts/dto/get-posts-query-params.input-dto';
import { PaginatedCommentViewDto } from 'src/core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAllComments(postId: string, queryData: GetPostsQueryParams, userId: string | null): Promise<PaginatedCommentViewDto> {
    const posts = await this.dataSource.query(`SELECT * FROM posts WHERE id = $1`, [postId]);

    if (!posts[0]) {
      throw NotFoundDomainException.create('Post not found');
    }

    const { sortBy, sortDirection, pageNumber, pageSize } = queryData;

    const query = `
    SELECT c.*, 
    (SELECT u.login FROM users u WHERE u.id = c.commentator_id) as commentator_login,
    (SELECT COUNT(*) FROM likes l WHERE l.parent_id = c.id AND l.parent_type = 'comment' AND status = 'Like') as likes_count,
    (SELECT COUNT(*) FROM likes l WHERE l.parent_id = c.id AND l.parent_type = 'comment' AND status = 'Dislike') as dislikes_count,
    (SELECT l.status FROM likes l WHERE l.user_id = $1 AND l.parent_id = c.id AND l.parent_type = 'comment' ) as my_status
    FROM comments c
    WHERE post_id = $2 AND deleted_at IS NULL
    ORDER BY "${sortBy}" ${sortDirection} 
    LIMIT ${pageSize} OFFSET ${queryData.calculateSkip()}
    `;

    const comments = await this.dataSource.query(query, [userId, postId]);

    const commentsCount = await this.dataSource.query(
      `
      SELECT COUNT(*) 
      FROM comments 
      WHERE post_id = $1 AND deleted_at IS NULL`,
      [postId],
    );

    const commentsView = comments.map((comment) => CommentViewDto.mapToView(comment));
    return PaginatedCommentViewDto.mapToView({
      items: commentsView,
      page: pageNumber,
      size: pageSize,
      totalCount: +commentsCount[0].count,
    });
  }

  async findCommentByIdOrNotFound(commentId: string, userId: string | null): Promise<CommentViewDto> {
    const query = `
    SELECT c.*, 
    (SELECT u.login FROM users u WHERE u.id = c.commentator_id) as commentator_login,
    (SELECT COUNT(*) FROM likes l WHERE l.parent_id = c.id AND l.parent_type = 'comment' AND status = 'Like') as likes_count,
    (SELECT COUNT(*) FROM likes l WHERE l.parent_id = c.id AND l.parent_type = 'comment' AND status = 'Dislike') as dislikes_count,
    (SELECT l.status FROM likes l WHERE l.user_id = $1 AND l.parent_id = c.id AND l.parent_type = 'comment' ) as my_status
    FROM comments c
    WHERE id = $2 AND deleted_at IS NULL
    `;
    const comments = await this.dataSource.query(query, [userId, commentId]);
    if (!comments[0]) {
      throw NotFoundDomainException.create();
    }

    return CommentViewDto.mapToView(comments[0]);
  }
}
