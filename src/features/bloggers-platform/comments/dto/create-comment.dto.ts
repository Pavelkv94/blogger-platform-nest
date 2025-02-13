import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Length } from 'class-validator';
import { commentContentConstraints } from '../domain/comment.entity';
import { IsNotEmptyString } from '../../../../core/decorators/validation/IsNotEmptyString';

export class CreateCommentUriParams {
  @ApiProperty({ example: 'Post ID', description: 'ID of the post' })
  @IsString()
  postId: string;
}

export class CreateCommentInputDto {
  @ApiProperty({ example: 'content', description: 'Comment content' })
  @IsNotEmptyString()
  @Length(commentContentConstraints.minLength, commentContentConstraints.maxLength)
  content: string;
}

export class CreateCommentDto {
  content: string;
  postId: string;
  user: any;
}
