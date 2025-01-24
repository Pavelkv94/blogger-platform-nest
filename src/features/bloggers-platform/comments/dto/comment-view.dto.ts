import { ApiProperty } from '@nestjs/swagger';
import { CommentDocument } from '../domain/comment.entity';
import { LikeStatus } from '../../likes/dto/like-status.dto';
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
  likesInfo: LikesInfo & { myStatus: LikeStatus };

  constructor(model: any) {
    this.id = model.id.toString();
    this.content = model.content;
    this.createdAt = model.created_at;
    this.commentatorInfo = {
      userId: model.commentator_id.toString(),
      userLogin: model.commentator_login,
    };
    this.likesInfo = {
      likesCount: +model.likes_count,
      dislikesCount: +model.dislikes_count,
      myStatus: model.my_status || LikeStatus.None,
    };
  }

  static mapToView(comment: CommentDocument): CommentViewDto {
    return new CommentViewDto(comment);
  }
}
