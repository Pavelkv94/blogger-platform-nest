import { Injectable } from '@nestjs/common';
import { GetPostsQueryParams } from '../dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../dto/post-view.dto';
import { PaginatedPostViewDto } from 'src/core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../domain/post.entity';
import { Blog } from '../../blogs/domain/blog.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectRepository(Post) private postRepositoryTypeOrm: Repository<Post>) {}

  async findAllPosts(queryData: GetPostsQueryParams, userId: string | null, blog_id?: string): Promise<PaginatedPostViewDto> {
    const { sortBy, sortDirection, pageNumber, pageSize } = queryData;

    const queryBuilder = this.postRepositoryTypeOrm.createQueryBuilder('p').where('p.deletedAt IS NULL');

    if (blog_id) {
      queryBuilder.andWhere('p.blogId = :blogId', { blogId: blog_id });
    }

    if (userId) {
      queryBuilder.andWhere('p.userId = :userId', { userId });
    }
    const subQuery = this.postRepositoryTypeOrm.createQueryBuilder().select('b.name').from(Blog, 'b').where('b.id = p.blogId').limit(1).getQuery();

    if (sortBy === 'blogName') {
      queryBuilder.addOrderBy(`(${subQuery})`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
  } else {
      queryBuilder.orderBy(`p.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
  }

    const posts = await queryBuilder
      .addSelect(`(${subQuery})`, 'blogName')
      .skip(queryData.calculateSkip())
      .take(pageSize)
      .getRawMany();

    const postsCount = await queryBuilder.getCount();

    const postsView = posts.map((post) => PostViewDto.mapToView(post));

    // const valuesForPosts: string[] = [];
    // const valuesForPostsCount: string[] = [];

    // if (blog_id) {
    //   valuesForPosts.push(blog_id);
    //   valuesForPostsCount.push(blog_id);
    // }

    // if (userId) {
    //   valuesForPosts.push(userId);
    // }

    // const query = `
    // WITH post_likes AS (
    // SELECT l.user_id, l.updated_at, (SELECT u.login FROM users u WHERE u.id = l.user_id) as user_login, l.parent_id
    // FROM likes l
    // WHERE l.parent_type = 'post' AND l.status = 'Like'
    // ORDER BY l.updated_at DESC
    // )

    // SELECT p.*,
    // (SELECT b.name FROM blogs b WHERE b.id = p.blog_id) as "blogName",
    // (SELECT COUNT(*) FROM likes l WHERE l.parent_id = p.id AND l.parent_type = 'post' AND status = 'Like') as likes_count,
    // (SELECT COUNT(*) FROM likes l WHERE l.parent_id = p.id AND l.parent_type = 'post' AND status = 'Dislike') as dislikes_count,
    // ${userId ? `(SELECT l.status FROM likes l WHERE l.parent_type = 'post' AND l.parent_id = p.id AND l.user_id = $${valuesForPosts.indexOf(userId) + 1}) as my_status,` : ''}
    // (SELECT jsonb_agg(json_build_object('userId', pl.user_id, 'addedAt', pl.updated_at, 'login', pl.user_login))
    // FROM (
    //   SELECT user_id, updated_at, user_login, parent_id
    //   FROM post_likes pl
    //   WHERE pl.parent_id = p.id
    //   ORDER BY pl.updated_at DESC
    //   LIMIT 3
    // ) pl
    // ) AS newest_likes
    // FROM posts p
    // WHERE p.deleted_at IS NULL ${blog_id ? `AND p.blog_id = $${valuesForPosts.indexOf(blog_id) + 1}` : ''}
    // ORDER BY "${sortBy}" ${sortDirection}
    // LIMIT ${pageSize} OFFSET ${queryData.calculateSkip()};
    // `;

    // const posts = await this.datasourse.query(query, valuesForPosts);

    // const postsCount = await this.datasourse.query(
    //   `
    //   SELECT COUNT(*)
    //   FROM posts p
    //   WHERE p.deleted_at IS NULL ${blog_id ? `AND p.blog_id = $${valuesForPosts.indexOf(blog_id) + 1}` : ''};
    // `,
    //   valuesForPostsCount,
    // );

    // const postsView = posts.map((post) => PostViewDto.mapToView(post));

    return PaginatedPostViewDto.mapToView({
      items: postsView,
      page: pageNumber,
      size: pageSize,
      totalCount: postsCount,
    });
  }

  async findPostByIdOrNotFoundFail(post_id: string, userId: string | null): Promise<PostViewDto> {
    const queryBuilder = this.postRepositoryTypeOrm.createQueryBuilder('p').where('p.id = :post_id AND p.deletedAt IS NULL', { post_id });

    if (userId) {
      queryBuilder.andWhere('p.userId = :userId', { userId });
    }

    const subQuery = this.postRepositoryTypeOrm.createQueryBuilder().select('b.name').from(Blog, 'b').where('b.id = p.blogId').limit(1).getQuery();

    const post = await queryBuilder.addSelect(`(${subQuery})`, 'blogName').getRawOne();

    if (!post) {
      throw NotFoundDomainException.create('Post not found');
    }

    return PostViewDto.mapToView(post);

    // const values: string[] = [post_id];
    // if (userId) {
    //   values.push(userId);
    // }

    // const query = `
    // WITH post_likes AS (
    // SELECT l.user_id, l.updated_at, (SELECT u.login FROM users u WHERE u.id = l.user_id) as user_login, l.parent_id
    // FROM likes l
    // WHERE l.parent_type = 'post' AND l.status = 'Like'
    // ORDER BY l.updated_at DESC
    // )

    // SELECT p.*,
    // (SELECT b.name FROM blogs b WHERE b.id = p.blog_id) as "blogName",
    // (SELECT COUNT(*) FROM likes l WHERE l.parent_id = p.id AND l.parent_type = 'post' AND status = 'Like') as likes_count,
    // (SELECT COUNT(*) FROM likes l WHERE l.parent_id = p.id AND l.parent_type = 'post' AND status = 'Dislike') as dislikes_count,
    // ${userId ? `(SELECT l.status FROM likes l WHERE l.parent_type = 'post' AND l.parent_id = p.id AND l.user_id = $2) as my_status,` : ''}
    // (SELECT jsonb_agg(json_build_object('userId', pl.user_id, 'addedAt', pl.updated_at, 'login', pl.user_login))
    // FROM (
    //   SELECT user_id, updated_at, user_login, parent_id
    //   FROM post_likes pl
    //   WHERE pl.parent_id = p.id
    //   ORDER BY pl.updated_at DESC
    //   LIMIT 3
    // ) pl
    // ) AS newest_likes
    // FROM posts p
    // WHERE id = $1 AND deleted_at IS NULL
    // `;

    // const posts = await this.datasourse.query(query, values);

    // if (!posts[0]) {
    //   throw NotFoundDomainException.create('Post not found');
    // }

    // return PostViewDto.mapToView(posts[0]);
  }
}
