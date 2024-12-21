import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostEntity } from '../domain/post.entity';
import { GetPostsQueryParams } from '../dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../dto/post-view.dto';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { PaginatedPostViewDto } from 'src/core/dto/base.paginated.view-dto';
import { LikeStatus } from '../../likes/dto/like-status.dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { LikeEntity, LikeModelType } from '../../likes/domain/like.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostEntity.name)
    private readonly postModel: Model<PostEntity>,
    @InjectModel(LikeEntity.name) private LikeModel: LikeModelType,
  ) {}

  async findAllPosts(query: GetPostsQueryParams, userId: string | null, blog_id?: string): Promise<PaginatedPostViewDto> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const filter: any = blog_id ? { blogId: blog_id } : {};

    const postsFromDb = await this.postModel
      .find({ ...filter, deletionStatus: DeletionStatus.NotDeleted })
      .skip(query.calculateSkip())
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const postIds = postsFromDb.map((post) => post.id);

    const likes = await this.LikeModel.find({ parent_id: { $in: postIds } })
      .sort({ updatedAt: 'desc' })
      .lean();

    let postsView: PostViewDto[];

    if (!userId) {
      postsView = postsFromDb.map((post) => {
        const newestLikes = likes
          .filter((like) => like.parent_id === post.id && like.status === LikeStatus.Like)
          .slice(0, 3)
          .map((like) => ({
            addedAt: like.updatedAt,
            userId: like.user_id,
            login: like.user_login,
          }));

        return PostViewDto.mapToView(post, LikeStatus.None, newestLikes);
      });
    } else {
      const userLikes = likes.filter((like) => like.user_id === userId);

      postsView = postsFromDb.map((post) => {
        const postLikes = userLikes.filter((like) => like.parent_id === post.id);
        const newestLikes = likes
          .filter((like) => like.parent_id === post.id && like.status === LikeStatus.Like)
          .slice(0, 3)
          .map((like) => ({
            addedAt: like.updatedAt,
            userId: like.user_id,
            login: like.user_login,
          }));

        const myStatus = postLikes.length > 0 ? postLikes[0].status : LikeStatus.None;

        return PostViewDto.mapToView(post, myStatus, newestLikes);
      });
    }
    return PaginatedPostViewDto.mapToView({
      items: postsView,
      page: pageNumber,
      size: pageSize,
      totalCount: postsFromDb.length,
    });
  }

  async findPostByIdOrNotFoundFail(post_id: string, userId: string | null): Promise<PostViewDto> {
    const post = await this.postModel.findOne({ _id: post_id, deletionStatus: DeletionStatus.NotDeleted });
    if (!post) {
      throw NotFoundDomainException.create('Post not found');
    }

    const postLikes = await this.LikeModel.find({ parent_id: post_id }).sort({ updatedAt: 'desc' }).lean();

    const newestLikes = postLikes
      .filter((like) => like.status === 'Like')
      .slice(0, 3)
      .map((like) => ({ addedAt: like.updatedAt, userId: like.user_id, login: like.user_login }));
    const currentUserLike = postLikes.find((like) => like.user_id === userId);
    const myStatus = currentUserLike ? currentUserLike.status : LikeStatus.None;
    return PostViewDto.mapToView(post, myStatus, newestLikes);
  }
}
