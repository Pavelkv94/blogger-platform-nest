import { ApiProperty } from '@nestjs/swagger';
import { CommentDocument } from '../domain/comment.entity';
import { LikeStatuses } from '../../likes/dto/like-status.dto';
import { CommentatorInfo } from '../domain/commentator-info.schema';
import { LikesInfo } from '../domain/likes-info.schema';

export class CommentViewDto {
  @ApiProperty({ example: 'Comment ID', description: 'ID of the comment' })
  id: string;
  @ApiProperty({ example: 'Comment content', description: 'Content of the comment' })
  content: string;
  @ApiProperty({ example: 'Created at', description: 'Created at date' })
  createdAt: Date;
  @ApiProperty({ example: 'Commentator info', description: 'Commentator info' })
  commentatorInfo: CommentatorInfo;
  @ApiProperty({ example: 'Likes info', description: 'Likes info' })
  likesInfo: LikesInfo & { myStatus: LikeStatuses };

  constructor(model: CommentDocument, myStatus: LikeStatuses) {
    this.id = model._id.toString();
    this.content = model.content;
    this.content = model.content;
    this.createdAt = model.createdAt;
    this.commentatorInfo = model.commentatorInfo;
    this.likesInfo = {
      likesCount: model.likesInfo.likesCount,
      dislikesCount: model.likesInfo.dislikesCount,
      myStatus: myStatus, //external
    };
  }

  static mapToView(comment: CommentDocument, myStatus: LikeStatuses): CommentViewDto {
    return new CommentViewDto(comment, myStatus);
  }
}
