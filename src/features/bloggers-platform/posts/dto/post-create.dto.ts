import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { contentConstraints, shortDescriptionConstraints, titleConstraints } from '../domain/post.entity';
import { IsNotEmptyString } from '../../../../core/decorators/validation/IsNotEmptyString';
import { BlogIsNotExist } from '../api/validation/blogIsExist.decorator';

export class CreatePostForBlogDto {
  @ApiProperty({ example: 'Post title', description: 'Title of the post' })
  @IsNotEmptyString()
  @Length(titleConstraints.minLength, titleConstraints.maxLength)
  title: string;

  @ApiProperty({ example: 'Short description', description: 'Short description of the post' })
  @IsNotEmptyString()
  @Length(shortDescriptionConstraints.minLength, shortDescriptionConstraints.maxLength)
  shortDescription: string;

  @ApiProperty({ example: 'Content', description: 'Content of the post' })
  @IsNotEmptyString()
  @Length(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;
}

export class CreatePostDto extends CreatePostForBlogDto {
  @ApiProperty({ example: 'Blog ID', description: 'ID of the blog' })
  @IsString()
  @BlogIsNotExist()
  blogId: string;
}
