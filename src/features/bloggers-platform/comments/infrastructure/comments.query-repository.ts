import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentEntity, CommentModelType } from '../domain/comment.entity';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { CommentViewDto } from '../dto/comment-view.dto';
import { LikeStatus } from '../../likes/dto/like-status.dto';
import { GetPostsQueryParams } from '../../posts/dto/get-posts-query-params.input-dto';
import { PaginatedCommentViewDto } from 'src/core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { LikeEntity, LikeModelType } from '../../likes/domain/like.entity';
import { PostEntity, PostModelType } from '../../posts/domain/post.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(CommentEntity.name) private CommentModel: CommentModelType,
    @InjectModel(LikeEntity.name) private LikeModel: LikeModelType,
    @InjectModel(PostEntity.name) private PostModel: PostModelType,

  ) {}

  async findAllComments(postId: string, query: GetPostsQueryParams, userId: string | null): Promise<PaginatedCommentViewDto> {
    //! проверка здесь?
    const post = await this.PostModel.findOne({_id: postId});
    if(!post) {
      throw NotFoundDomainException.create("Post not found")
    }
    
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const filter: any = { postId: postId };

    const commentsFromDb = await this.CommentModel.find({ ...filter, deletionStatus: DeletionStatus.NotDeleted })
      .skip(query.calculateSkip())
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });


    let commentsView: CommentViewDto[];

        if (!userId) {
            commentsView = commentsFromDb.map((comment) => CommentViewDto.mapToView(comment, LikeStatus.None));
        } else {
            const userLikes = await this.LikeModel.find({ user_id: userId }).lean();

            if (!userLikes) {
                commentsView = commentsFromDb.map((comment) => CommentViewDto.mapToView(comment, LikeStatus.None));
            }

            commentsView = commentsFromDb.map((comment) => {
                const like = userLikes.find((like) => like.parent_id === comment.id);
                const myStatus = like ? like.status : LikeStatus.None;
                return CommentViewDto.mapToView(comment, myStatus);
            });
        }

    return PaginatedCommentViewDto.mapToView({
      items: commentsView,
      page: pageNumber,
      size: pageSize,
      totalCount: commentsFromDb.length,
    });
  }

  async findCommentByIdOrNotFound(commentId: string, userId: string | null): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({ _id: commentId, deletionStatus: DeletionStatus.NotDeleted });
    if (!comment) {
      throw NotFoundDomainException.create();
    }

    const likeFilter = userId ? { user_id: userId, parent_id: commentId } : { parent_id: commentId };
    const like = await this.LikeModel.findOne(likeFilter);

    const myStatus = like && like.user_id === userId ? like.status : LikeStatus.None;

    return CommentViewDto.mapToView(comment, myStatus);
  }
}
