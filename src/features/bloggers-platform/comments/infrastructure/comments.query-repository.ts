import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../dto/comment-view.dto';
import { GetPostsQueryParams } from '../../posts/dto/get-posts-query-params.input-dto';
import { PaginatedCommentViewDto } from 'src/core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../domain/comment.entity';
import { User } from 'src/features/user-accounts/domain/user/user.entity';
import { Like } from '../../likes/domain/like.entity';
import { LikeStatus } from '../../likes/dto/like-status.dto';
import { LikeParent } from '../../likes/dto/like-parent.dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectRepository(Comment) private commentRepositoryTypeOrm: Repository<Comment>) {}

  async findAllComments(postId: string, queryData: GetPostsQueryParams, userId: string | null): Promise<PaginatedCommentViewDto> {
    const { sortBy, sortDirection, pageNumber, pageSize } = queryData;

    const queryBuilder = this.commentRepositoryTypeOrm.createQueryBuilder('c').where('c.postId = :postId AND c.deletedAt IS NULL', { postId: Number(postId) });

    const comments = await queryBuilder
      .select('c.*')
      .addSelect((qb) => qb.select('u.login').from(User, 'u').where('u.id = c.commentatorId'), 'commentatorLogin')
      .addSelect(
        (qb) => qb.select('CAST(COUNT(*) as INT)').from(Like, 'l').where(`l.parentId = c.id AND l.parentType = '${LikeParent.Comment}' AND l.status = '${LikeStatus.Like}'`),
        'likesCount',
      )
      .addSelect(
        (qb) => qb.select('CAST(COUNT(*) as INT)').from(Like, 'l').where(`l.parentId = c.id AND l.parentType = '${LikeParent.Comment}' AND l.status = '${LikeStatus.Dislike}'`),
        'dislikesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select('l.status')
            .from(Like, 'l')
            .where(`l.userId = :userId AND l.parentId = c.id AND l.parentType = '${LikeParent.Comment}'`, { userId: Number(userId) }),
        'myStatus',
      )
      .orderBy(`c.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(queryData.calculateSkip())
      .take(pageSize)
      .getRawMany();

    const commentsCount = await queryBuilder.getCount();

    const commentsView = comments.map((comment) => CommentViewDto.mapToView(comment));

    return PaginatedCommentViewDto.mapToView({
      items: commentsView,
      page: pageNumber,
      size: pageSize,
      totalCount: commentsCount,
    });
  }

  async findCommentByIdOrNotFound(commentId: string, userId: string | null): Promise<CommentViewDto> {
    const comment = await this.commentRepositoryTypeOrm
      .createQueryBuilder('c')
      .select('c.*')
      .addSelect((qb) => qb.select('u.login').from(User, 'u').where('u.id = c.commentatorId'), 'commentatorLogin')
      .addSelect(
        (qb) =>
          qb
            .select('CAST(COUNT(*) as INT)')
            .from(Like, 'l')
            .where(`l.parentId = :commentId AND l.parentType = '${LikeParent.Comment}' AND l.status = '${LikeStatus.Like}'`, {
              commentId: Number(commentId),
            }),

        'likesCount',
      )
      .addSelect(
        (qb2) =>
          qb2
            .select('CAST(COUNT(*) as INT)')
            .from(Like, 'l')
            .where(`l.parentId = :commentId AND l.parentType = '${LikeParent.Comment}' AND l.status = '${LikeStatus.Dislike}'`, {
              commentId: Number(commentId),
            }),
        'dislikesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select('l.status')
            .from(Like, 'l')
            .where('l.userId = :userId AND l.parentId = :commentId AND l.parentType = :parentType', {
              userId: Number(userId),
              commentId: Number(commentId),
              parentType: LikeParent.Comment,
            }),
        'myStatus',
      )

      .where('c.id = :commentId AND c.deletedAt IS NULL', { commentId: Number(commentId) })
      .getRawOne();

    if (!comment) {
      throw NotFoundDomainException.create();
    }
    return CommentViewDto.mapToView(comment);
  }
}
