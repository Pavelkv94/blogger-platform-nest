import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '../domain/comment.entity';
import { LikeStatus } from '../../likes/dto/like-status.dto';
  
export type CommentatorInfo = {
  userId: string;
  userLogin: string;
}

export type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}


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
    this.createdAt = model.createdAt;
    this.commentatorInfo = {
      userId: model.commentatorId.toString(),
      userLogin: model.commentatorLogin,
    };
    this.likesInfo = {
      likesCount: model.likesCount,
      dislikesCount: model.dislikesCount,
      myStatus: model.myStatus || LikeStatus.None,
    };
  }

  static mapToView(comment: Comment): CommentViewDto {
    return new CommentViewDto(comment);
  }
}
