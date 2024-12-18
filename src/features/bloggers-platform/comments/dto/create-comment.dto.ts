import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Length } from 'class-validator';
import { commentContentConstraints } from '../domain/comment.entity';
import { UserDocument } from 'src/features/user-accounts/domain/user.entity';

export class CreateCommentUriParams {
  @ApiProperty({ example: 'Post ID', description: 'ID of the post' })
  @IsString()
  postId: string;
}

export class CreateCommentInputDto {
  @ApiProperty({ example: 'content', description: 'Comment content' })
  @IsString()
  @Length(commentContentConstraints.minLength, commentContentConstraints.maxLength)
  content: string;
}

export class CreateCommentDto {
  content: string;
  postId: string;
  user: UserDocument;
}
