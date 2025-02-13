import { Injectable } from '@nestjs/common';
import { GetPostsQueryParams } from '../dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../dto/post-view.dto';
import { PaginatedPostViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../../core/exeptions/domain-exceptions';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../domain/post.entity';
import { Blog } from '../../blogs/domain/blog.entity';
import { Like } from '../../likes/domain/like.entity';
import { LikeParent } from '../../likes/dto/like-parent.dto';
import { LikeStatus } from '../../likes/dto/like-status.dto';
import { User } from '../../../user-accounts/domain/user/user.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectRepository(Post) private postRepositoryTypeOrm: Repository<Post>) {}

  async findAllPosts(queryData: GetPostsQueryParams, userId: string | null, blog_id?: string): Promise<PaginatedPostViewDto> {
    const { sortBy, sortDirection, pageNumber, pageSize } = queryData;

    const queryBuilder = this.postRepositoryTypeOrm.createQueryBuilder('p').where('p."deletedAt" IS NULL');

    if (blog_id) {
      queryBuilder.andWhere('p."blogId" = :blogId', { blogId: Number(blog_id) });
    }

    const subQuery = this.postRepositoryTypeOrm.createQueryBuilder().select('b.name').from(Blog, 'b').where('b.id = p."blogId"').limit(1).getQuery();

    if (sortBy === 'blogName') {
      queryBuilder.addOrderBy(`(${subQuery})`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy(`p.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
    }

    const posts = await queryBuilder
      .addSelect(this.getSubQueryForBlogName, 'blogName')
      .addSelect(this.getSubQueryForLikesCount, 'likesCount')
      .addSelect(this.getSubQueryForDislikesCount, 'dislikesCount')
      .addSelect(this.getSubQueryForMyStatus(userId), 'myStatus')
      .addSelect(this.getSubQueryForNewestLikes, 'newestLikes')
      .orderBy(`${sortBy === 'blogName' ? sortBy : `p.${sortBy}`}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(queryData.calculateSkip())
      .take(pageSize)
      .getRawMany();

    const postsCount = await queryBuilder.getCount();

    const postsView = posts.map((post) => PostViewDto.mapToView(post));

    return PaginatedPostViewDto.mapToView({
      items: postsView,
      page: pageNumber,
      size: pageSize,
      totalCount: postsCount,
    });
  }

  async findPostByIdOrNotFoundFail(post_id: string, userId: string | null): Promise<PostViewDto> {
    const queryBuilder = this.postRepositoryTypeOrm.createQueryBuilder('p').where('p.id = :post_id AND p.deletedAt IS NULL', { post_id: Number(post_id) });

    const post = await queryBuilder
      .addSelect(this.getSubQueryForBlogName, 'blogName')
      .addSelect(this.getSubQueryForLikesCount, 'likesCount')
      .addSelect(this.getSubQueryForDislikesCount, 'dislikesCount')
      .addSelect(this.getSubQueryForMyStatus(userId), 'myStatus')
      .addSelect(this.getSubQueryForNewestLikes, 'newestLikes')
      .getRawOne();

    if (!post) {
      throw NotFoundDomainException.create('Post not found');
    }

    return PostViewDto.mapToView(post);
  }

  private getSubQueryForBlogName(queryBuilder: SelectQueryBuilder<Post>): SelectQueryBuilder<Blog> {
    return queryBuilder.select('b.name').from(Blog, 'b').where('b.id = p.blogId');
  }

  private getSubQueryForLikesCount(queryBuilder: SelectQueryBuilder<Post>): SelectQueryBuilder<Like> {
    return queryBuilder.select('CAST(COUNT(*) as INT)').from(Like, 'l').where(`l.parentId = p.id AND l.parentType = '${LikeParent.Post}' AND l.status = '${LikeStatus.Like}'`);
  }

  private getSubQueryForDislikesCount(queryBuilder: SelectQueryBuilder<Post>): SelectQueryBuilder<Like> {
    return queryBuilder.select('CAST(COUNT(*) as INT)').from(Like, 'l').where(`l.parentId = p.id AND l.parentType = '${LikeParent.Post}' AND l.status = '${LikeStatus.Dislike}'`);
  }

  private getSubQueryForMyStatus =
    (userId: string | null) =>
    (queryBuilder: SelectQueryBuilder<Post>): SelectQueryBuilder<Like> => {
      return queryBuilder
        .select('l.status')
        .from(Like, 'l')
        .where(`l.userId = :userId AND l.parentId = p.id AND l.parentType = '${LikeParent.Post}'`, { userId: Number(userId) });
    };

  private getSubQueryForNewestLikes(queryBuilder: SelectQueryBuilder<Post>): SelectQueryBuilder<Like> {
    const subQueryForUserLogin = (qb) => qb.select('u.login').from(User, 'u').where('u.id = l.userId');

    return queryBuilder
      .select(`jsonb_agg(json_build_object('userId', pl."userId", 'addedAt', pl."updatedAt", 'login', pl."userLogin"))`)
      .from(
        (qb) =>
          qb
            .select('l.*')
            .addSelect(subQueryForUserLogin, 'userLogin')
            .from(Like, 'l')
            .where(`l.parentId = p.id AND l.parentType = '${LikeParent.Post}' AND l.status = '${LikeStatus.Like}'`)
            .orderBy('l.updatedAt', 'DESC')
            .limit(3),
        'pl',
      );
  }
}
