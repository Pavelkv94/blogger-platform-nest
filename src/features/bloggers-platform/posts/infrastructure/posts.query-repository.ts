import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostEntity } from '../domain/post.entity';
import { GetPostsQueryParams } from '../dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../dto/post-view.dto';
import { PaginatedPostViewDto } from 'src/core/dto/base.paginated.view-dto';
import { LikeStatus } from '../../likes/dto/like-status.dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { LikeEntity, LikeModelType } from '../../likes/domain/like.entity';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostEntity.name)
    private readonly postModel: Model<PostEntity>,
    @InjectModel(LikeEntity.name) private LikeModel: LikeModelType,
    @InjectDataSource() private datasourse: DataSource,
  ) {}

  async findAllPosts(queryData: GetPostsQueryParams, userId: string | null, blog_id?: string): Promise<PaginatedPostViewDto> {
    const { sortBy, sortDirection, pageNumber, pageSize } = queryData;
    const values: string[] = [];

    if (blog_id) {
      values.push(blog_id);
    }

    const query = `
    SELECT *, (SELECT name FROM blogs WHERE id = posts.blog_id) as "blogName" 
    FROM posts 
    WHERE deleted_at IS NULL ${blog_id ? `AND blog_id = $${values.length}` : ''}
    ORDER BY "${sortBy}" ${sortDirection} 
    LIMIT ${pageSize} OFFSET ${queryData.calculateSkip()}
    `;
    console.log(query);

    const blogs = await this.datasourse.query(query, values);

    const blogsCount = await this.datasourse.query(
      `
      SELECT COUNT(*) FROM posts 
      WHERE deleted_at IS NULL ${blog_id ? `AND blog_id = $1` : ''}
    `,
      values,
    );

    const postsView = blogs.map((post) => PostViewDto.mapToView(post, LikeStatus.None, []));

    return PaginatedPostViewDto.mapToView({
      items: postsView,
      page: pageNumber,
      size: pageSize,
      totalCount: +blogsCount[0].count,
    });

    // const filter: any = blog_id ? { blogId: blog_id } : {};

    // const postsFromDb = await this.postModel
    //   .find({ ...filter, deletionStatus: DeletionStatus.NotDeleted })
    //   .skip(query.calculateSkip())
    //   .limit(pageSize)
    //   .sort({ [sortBy]: sortDirection });

    // const postIds = postsFromDb.map((post) => post.id);

    // const likes = await this.LikeModel.find({ parent_id: { $in: postIds } })
    //   .sort({ updatedAt: 'desc' })
    //   .lean();

    // let postsView: PostViewDto[];

    // if (!userId) {
    //   postsView = postsFromDb.map((post) => {
    //     const newestLikes = likes
    //       .filter((like) => like.parent_id === post.id && like.status === LikeStatus.Like)
    //       .slice(0, 3)
    //       .map((like) => ({
    //         addedAt: like.updatedAt,
    //         userId: like.user_id,
    //         login: like.user_login,
    //       }));

    //     return PostViewDto.mapToView(post, LikeStatus.None, newestLikes);
    //   });
    // } else {
    //   const userLikes = likes.filter((like) => like.user_id === userId);

    //   postsView = postsFromDb.map((post) => {
    //     const postLikes = userLikes.filter((like) => like.parent_id === post.id);
    //     const newestLikes = likes
    //       .filter((like) => like.parent_id === post.id && like.status === LikeStatus.Like)
    //       .slice(0, 3)
    //       .map((like) => ({
    //         addedAt: like.updatedAt,
    //         userId: like.user_id,
    //         login: like.user_login,
    //       }));

    //     const myStatus = postLikes.length > 0 ? postLikes[0].status : LikeStatus.None;

    //     return PostViewDto.mapToView(post, myStatus, newestLikes);
    //   });
    // }
    // return PaginatedPostViewDto.mapToView({
    //   items: postsView,
    //   page: pageNumber,
    //   size: pageSize,
    //   totalCount: postsFromDb.length,
    // });
  }

  async findPostByIdOrNotFoundFail(post_id: string, userId: string | null): Promise<PostViewDto> {
    const posts = await this.datasourse.query(
      `
      SELECT *, (SELECT name FROM blogs WHERE id = posts.blog_id) as "blogName" 
      FROM posts 
      WHERE id = $1 AND deleted_at IS NULL
    `,
      [post_id],
    );
    if (!posts[0]) {
      throw NotFoundDomainException.create('Post not found');
    }

    // const postLikes = await this.LikeModel.find({ parent_id: post_id }).sort({ updatedAt: 'desc' }).lean();

    // const newestLikes = postLikes
    //   .filter((like) => like.status === 'Like')
    //   .slice(0, 3)
    //   .map((like) => ({ addedAt: like.updatedAt, userId: like.user_id, login: like.user_login }));
    // const currentUserLike = postLikes.find((like) => like.user_id === userId);
    // const myStatus = currentUserLike ? currentUserLike.status : LikeStatus.None;
    //    return PostViewDto.mapToView(post, myStatus, newestLikes);

    return PostViewDto.mapToView(posts[0], LikeStatus.None, []);
  }
}
