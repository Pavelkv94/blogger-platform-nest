import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../dto/comment-view.dto';
import { GetPostsQueryParams } from '../../posts/dto/get-posts-query-params.input-dto';
import { PaginatedCommentViewDto } from 'src/core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../domain/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comment) private commentRepositoryTypeOrm: Repository<Comment>,
  ) {}

  async findAllComments(postId: string, queryData: GetPostsQueryParams, userId: string | null): Promise<PaginatedCommentViewDto> {
    const { sortBy, sortDirection, pageNumber, pageSize } = queryData;

    const queryBuilder = this.commentRepositoryTypeOrm.createQueryBuilder('c').where('c.postId = :postId AND c.deletedAt IS NULL', { postId });

    const comments = await queryBuilder
      .orderBy(`c.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(queryData.calculateSkip())
      .take(pageSize)
      .getRawMany();

    // const posts = await this.dataSource.query(`SELECT * FROM posts WHERE id = $1`, [postId]);

    // if (!posts[0]) {
    //   throw NotFoundDomainException.create('Post not found');
    // }

    // const query = `
    // SELECT c.*,
    // (SELECT u.login FROM users u WHERE u.id = c.commentator_id) as commentator_login,
    // (SELECT COUNT(*) FROM likes l WHERE l.parent_id = c.id AND l.parent_type = 'comment' AND status = 'Like') as likes_count,
    // (SELECT COUNT(*) FROM likes l WHERE l.parent_id = c.id AND l.parent_type = 'comment' AND status = 'Dislike') as dislikes_count,
    // (SELECT l.status FROM likes l WHERE l.user_id = $1 AND l.parent_id = c.id AND l.parent_type = 'comment' ) as my_status
    // FROM comments c
    // WHERE post_id = $2 AND deleted_at IS NULL
    // ORDER BY "${sortBy}" ${sortDirection}
    // LIMIT ${pageSize} OFFSET ${queryData.calculateSkip()}
    // `;

    // const comments = await this.dataSource.query(query, [userId, postId]);

    // const commentsCount = await this.dataSource.query(
    //   `
    //   SELECT COUNT(*)
    //   FROM comments
    //   WHERE post_id = $1 AND deleted_at IS NULL`,
    //   [postId],
    // );
    const commentsCount = await queryBuilder.getCount();

    const commentsView = comments.map((comment) => CommentViewDto.mapToView(comment));
    console.log(commentsView);

    return PaginatedCommentViewDto.mapToView({
      items: commentsView,
      page: pageNumber,
      size: pageSize,
      totalCount: commentsCount,
    });
  }

  async findCommentByIdOrNotFound(commentId: string, userId: string | null): Promise<CommentViewDto> {
    const queryBuilder = this.commentRepositoryTypeOrm.createQueryBuilder('c').where('c.id = :commentId AND c.deletedAt IS NULL', { commentId });

    if (userId) {
      queryBuilder.andWhere('c.commentatorId = :userId', { userId });
    }

    const comment = await queryBuilder.getRawOne();

    if (!comment) {
      throw NotFoundDomainException.create();
    }

    return CommentViewDto.mapToView(comment);

    // const query = `
    // SELECT c.*,
    // (SELECT u.login FROM users u WHERE u.id = c.commentator_id) as commentator_login,
    // (SELECT COUNT(*) FROM likes l WHERE l.parent_id = c.id AND l.parent_type = 'comment' AND status = 'Like') as likes_count,
    // (SELECT COUNT(*) FROM likes l WHERE l.parent_id = c.id AND l.parent_type = 'comment' AND status = 'Dislike') as dislikes_count,
    // (SELECT l.status FROM likes l WHERE l.user_id = $1 AND l.parent_id = c.id AND l.parent_type = 'comment' ) as my_status
    // FROM comments c
    // WHERE id = $2 AND deleted_at IS NULL
    // `;
    // const comments = await this.dataSource.query(query, [userId, commentId]);
    // if (!comments[0]) {
    //   throw NotFoundDomainException.create();
    // }

    // return CommentViewDto.mapToView(comments[0]);
  }
}
