import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentDocument, CommentEntity, CommentModelType } from '../domain/comment.entity';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { ResultObject, ResultStatus } from 'src/core/dto/result-object.dto';

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(CommentEntity.name) private CommentModel: CommentModelType) {}

  async findCommentById(commentId: string, userId?: string): Promise<ResultObject<CommentDocument | null>> {
    const comment = await this.CommentModel.findOne({ _id: commentId, deletionStatus: DeletionStatus.NotDeleted });
    if (!comment) {
      return {
        status: ResultStatus.NOT_FOUND,
        errorMessage: 'Comment Not Found',
        data: null,
      };
    }

    if (userId && comment.commentatorInfo.userId !== userId) {
      return {
        status: ResultStatus.FORBIDDEN,
        errorMessage: 'Access forbidden',
        data: null,
      };
    }
    return {
      status: ResultStatus.SUCCESS,
      data: comment,
    };
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }
}
