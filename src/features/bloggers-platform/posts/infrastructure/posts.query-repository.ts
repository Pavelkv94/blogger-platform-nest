import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostEntity } from '../domain/post.entity';
import { GetPostsQueryParams } from '../dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../dto/post-view.dto';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { PaginatedPostViewDto } from 'src/core/dto/base.paginated.view-dto';
import { LikeStatuses } from '../../likes/dto/like-status.dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostEntity.name)
    private readonly postModel: Model<PostEntity>,
  ) {}

  async findAllPosts(query: GetPostsQueryParams, blog_id?: string): Promise<PaginatedPostViewDto> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const filter: any = blog_id ? { blogId: blog_id } : {};

    const postsFromDb = await this.postModel
      .find({ ...filter, deletionStatus: DeletionStatus.NotDeleted })
      .skip(query.calculateSkip())
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const postsView = postsFromDb.map((post) => PostViewDto.mapToView(post, LikeStatuses.None, []));

    const postsCount = await this.#getPostsCount(blog_id);

    return PaginatedPostViewDto.mapToView({
      items: postsView,
      page: pageNumber,
      size: pageSize,
      totalCount: postsCount,
    });
    // const postIds = postsFromDb.map((post) => post.id);

    // const likes = await LikeModel.find({ parent_id: { $in: postIds } })
    //   .sort({ updatedAt: 'desc' })
    //   .lean();

    // let postsView: PostViewModel[];

    //   if (!userId) {
    //     postsView = postsFromDb.map((post) => {
    //       const newestLikes = likes
    //         .filter((like) => like.parent_id === post.id && like.status === 'Like')
    //         .slice(0, 3)
    //         .map((like) => ({
    //           addedAt: like.updatedAt,
    //           userId: like.user_id,
    //           login: like.user_login,
    //         }));
    //       return PostViewDto.mapToView(post, 'None', newestLikes);
    //     });
    //   } else {
    //     const userLikes = likes.filter((like) => like.user_id === userId);

    //     postsView = postsFromDb.map((post) => {
    //       const postLikes = userLikes.filter((like) => like.parent_id === post.id);
    //       const newestLikes = likes
    //         .filter((like) => like.parent_id === post.id && like.status === 'Like')
    //         .slice(0, 3)
    //         .map((like) => ({
    //           addedAt: like.updatedAt,
    //           userId: like.user_id,
    //           login: like.user_login,
    //         }));
    //       const myStatus = postLikes.length > 0 ? postLikes[0].status : 'None';
    //       return PostViewDto.mapToView(post, myStatus, newestLikes);
    //     });
    //   }

    //   const postsCount = await this.getPostsCount(blog_id);

    //   return {
    //     pagesCount: Math.ceil(postsCount / query.pageSize),
    //     page: query.pageNumber,
    //     pageSize: query.pageSize,
    //     totalCount: postsCount,
    //     items: postsView,
    //   };
  }

  async findPostByIdOrNotFoundFail(post_id: string): Promise<PostViewDto> {
    const post = await this.postModel.findOne({ _id: post_id, deletionStatus: DeletionStatus.NotDeleted });
    if (!post) {
      throw NotFoundDomainException.create('Post not found');
    }
    return PostViewDto.mapToView(post, LikeStatuses.None, []);
  }

  async #getPostsCount(blog_id?: string): Promise<number> {
    const filter: any = blog_id ? { blogId: blog_id } : {};

    return this.postModel.countDocuments(filter);
  }
}
