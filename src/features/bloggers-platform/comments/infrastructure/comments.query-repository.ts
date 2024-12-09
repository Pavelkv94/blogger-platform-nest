import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentEntity, CommentModelType } from '../domain/comment.entity';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { CommentViewDto } from '../dto/comment-view.dto';
import { LikeStatuses } from '../../likes/dto/like-status.dto';
import { GetPostsQueryParams } from '../../posts/dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectModel(CommentEntity.name) private CommentModel: CommentModelType) {}

  async findAllComments(postId: string, query: GetPostsQueryParams): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const filter: any = { postId: postId };

    const commentsFromDb = await this.CommentModel.find({ ...filter, deletionStatus: DeletionStatus.NotDeleted })
      .skip(query.calculateSkip())
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const commentsView = commentsFromDb.map((comment) => CommentViewDto.mapToView(comment, LikeStatuses.None));

    return PaginatedViewDto.mapToView({
      items: commentsView,
      page: pageNumber,
      size: pageSize,
      totalCount: commentsFromDb.length,
    });
  }

  async findCommentById(commentId: string): Promise<CommentViewDto | null> {
    const comment = await this.CommentModel.findOne({ _id: commentId, deletionStatus: DeletionStatus.NotDeleted });
    return comment ? CommentViewDto.mapToView(comment, LikeStatuses.None) : null;
  }
}
